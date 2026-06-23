#!/usr/bin/env -S npx tsx
/** End-to-end MCP acceptance smoke test — speaks REAL MCP over stdio.
 *
 * This is the loop an agent (Claude Code / Cursor) runs, exercised through the
 * actual protocol: initialize -> list tools -> vocabulary -> propose -> recall ->
 * search -> cleanup. Any implementation of the memotrust server must pass it.
 *
 * HERMETIC: it runs against a throwaway temp store (its own MEMOTRUST_HOME),
 * seeded with one trusted fixture and torn down at the end. It never reads or
 * writes the real memory/ store — so it passes on a fresh install and can never
 * leak a probe claim into real data.
 *
 * Run:  npm run test:e2e                                       (against the source)
 *       npx tsx scripts/mcp-smoke-test.ts node dist/cli.js mcp   (against the build)
 */

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXPECTED_TOOLS = new Set(["recall", "vocabulary", "propose", "describe_space",
  "search", "pending_verifications", "submit_evidence"]);

// A throwaway store home for this run. Set BEFORE importing the store (paths.ts
// resolves HOME at import time) and forwarded to the child, so both processes
// use it and the real memory/ store is never touched.
const SMOKE_HOME = fs.mkdtempSync(path.join(os.tmpdir(), "memotrust-smoke-"));
process.env.MEMOTRUST_HOME = SMOKE_HOME;

const failures: string[] = [];
function check(name: string, ok: boolean, detail = ""): void {
  if (!ok) failures.push(name);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
}

function contentJson(result: any): any {
  for (const c of result?.content ?? []) {
    if (c?.text) { try { return JSON.parse(c.text); } catch { return c.text; } }
  }
  return null;
}

const argv = process.argv.slice(2);
const [command, ...args] = argv.length ? argv : ["npx", "tsx", path.join(ROOT, "src/cli.ts"), "mcp"];

// Seed the throwaway store with one trusted fixture so recall/vocabulary have
// real data to return — the store facade writes it in the exact on-disk format.
const store = await import(path.join(ROOT, "src/store/index.js"));
const seedId = store.createClaim(
  "Postgres is the primary datastore", { component: "db" }, "seed", "Acme");
store.setStatus(seedId, store.Status.Verified, "seed fixture");

const client = new Client({ name: "mcp-smoke-test", version: "1.0.0" });
try {
  // forward env (esp. MEMOTRUST_HOME) so the spawned server shares this store;
  // the SDK's default only forwards a HOME/PATH whitelist
  await client.connect(new StdioClientTransport({
    command, args, cwd: ROOT, stderr: "ignore", env: { ...process.env } as Record<string, string>,
  }));
  const info = client.getServerVersion();
  console.log(`connected: ${info?.name} ${info?.version ?? ""}`.trim());

  const tools = new Set(((await client.listTools()).tools ?? []).map((t: any) => t.name));
  const missing = [...EXPECTED_TOOLS].filter((t) => !tools.has(t));
  check("tools/list exposes the 7 tools", missing.length === 0,
    missing.length ? `missing: ${missing}` : [...tools].sort().join(", "));

  const vocab = contentJson(await client.callTool({ name: "vocabulary", arguments: {} }));
  const spaces = (vocab?.spaces ?? []).map((s: any) => s.name);
  check("vocabulary() returns spaces + tags", spaces.includes("Acme") && "tags" in (vocab ?? {}),
    `spaces=${JSON.stringify(spaces)} tag_keys=${JSON.stringify(Object.keys(vocab?.tags ?? {}).sort())}`);

  const prop = contentJson(await client.callTool({ name: "propose", arguments: {
    claim: "MCP-PROBE throwaway claim", scope: { probe: "true" }, space: "Acme" } }));
  const pid = prop?.id;
  check("propose() stores as proposed", prop?.ok === true && prop?.status === "proposed", `id=${pid}`);

  const rec = contentJson(await client.callTool({ name: "recall", arguments: {
    query: "primary datastore", space: "Acme" } }));
  const trusted = (rec?.trusted ?? []).map((t: any) => t.claim);
  check("recall() ranks the seeded claim first",
    trusted.length > 0 && trusted[0].toLowerCase().includes("datastore"), `top=${JSON.stringify(trusted.slice(0, 1))}`);
  check("recall() withholds the unverified probe claim",
    trusted.every((t: string) => !t.includes("MCP-PROBE")),
    `withheld=${rec?.withheld_count} warnings=${(rec?.warnings ?? []).length}`);

  const found = contentJson(await client.callTool({ name: "search", arguments: { query: "MCP-PROBE" } }));
  check("search() finds it at any trust level", (found ?? []).some((h: any) => h.id === pid),
    `hits=${(found ?? []).length}`);

  const pend = contentJson(await client.callTool({ name: "pending_verifications", arguments: {} }));
  check("pending_verifications() answers", Array.isArray(pend), `${(pend ?? []).length} pending`);

  await client.close();

  // cleanup the throwaway through the store (delete is deliberately not an MCP tool)
  check("cleanup: throwaway deleted", store.deleteClaim(pid));
} finally {
  fs.rmSync(SMOKE_HOME, { recursive: true, force: true });
}

console.log(`\n${8 - failures.length}/8 checks passed`);
process.exit(failures.length ? 1 : 0);
