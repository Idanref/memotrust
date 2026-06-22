/** Tests for the generic verifiers + the verify orchestration.
 *
 * file / url / command checks with zero credentials, the command-check
 * security gate, and the full loop: claim with check -> runVerifier ->
 * status change + auditable receipt in the store.
 */

import * as fs from "node:fs";
import * as os from "node:os";
import * as http from "node:http";
import * as path from "node:path";
import assert from "node:assert/strict";
import { test, beforeEach, afterEach } from "node:test";

import * as verify from "../src/verify.js";
import * as store from "../src/store/index.js";
import * as generic from "../src/verifiers/generic.js";

let tmp: string;
let claims: string;

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "memotrust-vtest-"));
  claims = path.join(tmp, "claims");
  fs.mkdirSync(claims);
  fs.writeFileSync(path.join(tmp, "events.jsonl"), "", "utf-8");
  store.setPaths({ claimsDir: claims, eventsFile: path.join(tmp, "events.jsonl"),
                   spacesFile: path.join(tmp, "spaces.json") });
  delete process.env.MEMOTRUST_ALLOW_COMMAND_CHECKS;
});

afterEach(() => fs.rmSync(tmp, { recursive: true, force: true }));

function writeClaim(name: string, frontmatter: Record<string, string>): void {
  const lines = Object.entries(frontmatter).map(([k, v]) => `${k}: ${v}`).join("\n");
  fs.writeFileSync(path.join(claims, name), `---\n${lines}\n---\n`, "utf-8");
}

/* ---- routing ---- */
test("generic handles kind-checks; mixpanel keeps type-based ones", () => {
  assert.ok(generic.handles({ check: '{"kind": "file", "path": "x"}' }));
  assert.ok(!generic.handles({ check: '{"event": "Signup", "expect_top": "US"}' }));
  assert.ok(!generic.handles({}));
  const [name] = verify.verifierFor({ check: '{"kind": "url", "url": "https://x"}', scope: {} });
  assert.equal(name, "generic");
  const [name2] = verify.verifierFor({ check: '{"event": "Signup"}', scope: { type: "pricing" } });
  assert.equal(name2, "mixpanel");
});

/* ---- file checks ---- */
test("file check confirms contains and refutes when absent", async () => {
  const f = path.join(tmp, "pkg.json");
  fs.writeFileSync(f, '{"packageManager": "pnpm@9"}', "utf-8");
  const ok = await generic.verify({ check: JSON.stringify({ kind: "file", path: f, contains: "pnpm" }) });
  assert.equal(ok.outcome, "confirmed");
  assert.ok(ok.proof?.judged?.includes("found"));
  const bad = await generic.verify({ check: JSON.stringify({ kind: "file", path: f, contains: "yarn" }) });
  assert.equal(bad.outcome, "refuted");
});

test("file exists check", async () => {
  const f = path.join(tmp, "there.txt");
  fs.writeFileSync(f, "hi", "utf-8");
  const yes = await generic.verify({ check: JSON.stringify({ kind: "file", path: f, exists: true }) });
  assert.equal(yes.outcome, "confirmed");
  const no = await generic.verify({ check: JSON.stringify({ kind: "file", path: path.join(tmp, "missing"), exists: true }) });
  assert.equal(no.outcome, "refuted");
});

/* ---- url checks (against a local server — no external network) ---- */
test("url check judges status and body", async () => {
  const srv = http.createServer((_req, res) => { res.writeHead(200); res.end("verified memory for agents"); });
  await new Promise<void>((r) => srv.listen(0, "127.0.0.1", r));
  const port = (srv.address() as any).port;
  try {
    const ok = await generic.verify({ check: JSON.stringify(
      { kind: "url", url: `http://127.0.0.1:${port}/`, status: 200, contains: "verified" }) });
    assert.equal(ok.outcome, "confirmed");
    const bad = await generic.verify({ check: JSON.stringify(
      { kind: "url", url: `http://127.0.0.1:${port}/`, contains: "blockchain" }) });
    assert.equal(bad.outcome, "refuted");
  } finally { srv.close(); }
});

/* ---- command checks are gated ---- */
test("command checks are DISABLED by default (poisoned check must not execute)", async () => {
  const v = await generic.verify({ check: JSON.stringify({ kind: "command", run: "echo pwned", contains: "pwned" }) });
  assert.equal(v.outcome, "inconclusive");
  assert.match(v.detail, /disabled by default/);
});

test("command checks run when the operator opts in", async () => {
  process.env.MEMOTRUST_ALLOW_COMMAND_CHECKS = "1";
  const v = await generic.verify({ check: JSON.stringify({ kind: "command", run: "node --version", contains: "v" }) });
  assert.equal(v.outcome, "confirmed");
});

/* ---- agent-submitted observation: memotrust still judges ---- */
test("agent-submitted reading is judged by the store, not the agent", async () => {
  const v = await generic.verify(
    { check: JSON.stringify({ kind: "file", path: "whatever", contains: "pnpm" }) },
    () => "packageManager: pnpm@9"); // what the agent read
  assert.equal(v.outcome, "confirmed");
  const lie = await generic.verify(
    { check: JSON.stringify({ kind: "file", path: "whatever", contains: "pnpm" }) },
    () => "uses yarn actually");
  assert.equal(lie.outcome, "refuted"); // the reading decides, not the reader
});

/* ---- end to end: verify -> status + receipt in the store ---- */
test("runVerifier confirms a file claim and records the receipt", async () => {
  const f = path.join(tmp, "readme.md");
  fs.writeFileSync(f, "memotrust: verified memory", "utf-8");
  writeClaim("0001.md", { id: "0001", claim: "the readme mentions memotrust", status: "proposed",
    check: JSON.stringify({ kind: "file", path: f, contains: "memotrust" }) });
  const r = await verify.runVerifier("0001");
  assert.deepEqual([r.ok, r.verifier, r.outcome], [true, "generic", "confirmed"]);
  const c = store.allClaims()[0];
  assert.equal(c.status, "verified"); // decisive verdict flipped the status
  const receipt = c.evidence.find((e: any) => e.type === "verifier");
  assert.equal(receipt.effect, "verified");
  assert.ok(receipt.query && receipt.judged); // auditable receipt on the trail
  assert.equal(store.recall().trusted.length, 1); // now recallable
});

test("runVerifier refutes and the claim becomes a warning", async () => {
  writeClaim("0001.md", { id: "0001", claim: "config file exists", status: "proposed",
    check: JSON.stringify({ kind: "file", path: path.join(tmp, "nope.cfg"), exists: true }) });
  const r = await verify.runVerifier("0001");
  assert.equal(r.outcome, "refuted");
  const rec = store.recall();
  assert.equal(rec.trusted.length, 0);
  assert.equal(rec.warnings.length, 1); // disproven -> agents get warned
});
