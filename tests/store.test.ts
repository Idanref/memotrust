/** Tests for src/store.ts — the single source of truth.
 *
 * Run from the repo root:  npm test
 * Each test gets a fresh temp memory dir, so nothing touches real data.
 * Port of tests/test_store.py — same 17 cases, same assertions.
 */

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import assert from "node:assert/strict";
import { test, beforeEach, afterEach } from "node:test";

import * as store from "../src/store/index.js";

let tmp: string;
let claims: string;
let events: string;

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "memotrust-test-"));
  claims = path.join(tmp, "claims");
  fs.mkdirSync(claims);
  events = path.join(tmp, "events.jsonl");
  fs.writeFileSync(events, "", "utf-8");
  store.setPaths({ claimsDir: claims, eventsFile: events,
                   spacesFile: path.join(tmp, "spaces.json") });
});

afterEach(() => fs.rmSync(tmp, { recursive: true, force: true }));

function writeClaim(name: string, frontmatter: Record<string, string>, body = ""): void {
  const lines = Object.entries(frontmatter).map(([k, v]) => `${k}: ${v}`).join("\n");
  fs.writeFileSync(path.join(claims, name), `---\n${lines}\n---\n${body}`, "utf-8");
}

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/* ---- scope is open, emergent tags ---- */
test("scope is open tags", () => {
  writeClaim("0001-x.md", { id: "0001", claim: "Redis is fast", status: "verified",
                            app: "Acme", market: "FR", desk: "macro" });
  const c = store.parseClaim(path.join(claims, "0001-x.md"));
  assert.deepEqual(c.scope, { app: "Acme", market: "FR", desk: "macro" });
  assert.ok(!("status" in c.scope)); // reserved keys never leak in
  assert.ok(!("id" in c.scope));
});

test("space is reserved, not a tag", () => {
  writeClaim("0001-x.md", { id: "0001", claim: "x", status: "verified",
                            space: "Finance", asset: "rates" });
  const c = store.parseClaim(path.join(claims, "0001-x.md"));
  assert.equal(c.space, "Finance");
  assert.ok(!("space" in c.scope));
  assert.deepEqual(c.scope, { asset: "rates" });
});

/* ---- recall only returns earned trust ---- */
test("recall only trusted", () => {
  writeClaim("0001-v.md", { id: "0001", claim: "good", status: "verified" });
  writeClaim("0002-p.md", { id: "0002", claim: "unproven", status: "proposed" });
  writeClaim("0003-d.md", { id: "0003", claim: "bad", status: "disproven" });
  const r = store.recall();
  assert.deepEqual(r.trusted.map((t: any) => t.id), ["0001"]);
  assert.equal(r.withheld_count, 1); // the proposed one
  assert.equal(r.warnings.length, 1); // the disproven one
});

test("recall scope filter (case-insensitive)", () => {
  writeClaim("0001.md", { id: "0001", claim: "us", status: "verified", market: "US" });
  writeClaim("0002.md", { id: "0002", claim: "fr", status: "verified", market: "FR" });
  assert.deepEqual(store.recall(null, { market: "US" }).trusted.map((t: any) => t.id), ["0001"]);
  assert.deepEqual(store.recall(null, { market: "us" }).trusted.map((t: any) => t.id), ["0001"]);
});

/* ---- spaces partition strictly ---- */
test("recall space strict", () => {
  writeClaim("0001.md", { id: "0001", claim: "ce", status: "verified", space: "Acme" });
  writeClaim("0002.md", { id: "0002", claim: "fin", status: "verified", space: "Finance" });
  writeClaim("0003.md", { id: "0003", claim: "unfiled", status: "verified" });
  assert.deepEqual(store.recall(null, null, "Acme").trusted.map((t: any) => t.id), ["0001"]);
  assert.equal(store.recall(null, null, "all").trusted.length, 3);
  assert.equal(store.recall().trusted.length, 3); // no space == all
});

/* ---- writes ---- */
test("create and set space", () => {
  const nid = store.createClaim("Postgres beats MySQL", { market: "US" }, "you", "Acme");
  const file = () => fs.readdirSync(claims).find((f) => f.startsWith(`${nid}-`))!;
  let c = store.parseClaim(path.join(claims, file()));
  assert.deepEqual([c.space, c.scope, c.status], ["Acme", { market: "US" }, "proposed"]);
  store.setSpace(nid, "Personal");
  assert.equal(store.parseClaim(path.join(claims, file())).space, "Personal");
  store.setSpace(nid, ""); // clearing removes the line
  assert.equal(store.parseClaim(path.join(claims, file())).space, null);
});

test("set status bumps freshness", () => {
  writeClaim("0001.md", { id: "0001", claim: "x", status: "proposed", confidence: "none" });
  assert.ok(store.setStatus("0001", "human-approved"));
  const c = store.parseClaim(path.join(claims, "0001.md"));
  assert.equal(c.status, "human-approved");
  assert.equal(c.last_confirmed, todayISO());
});

/* ---- dispute lifecycle ---- */
test("dispute then resolve", () => {
  writeClaim("0001.md", { id: "0001", claim: "x", status: "verified" });
  assert.equal(store.recall().trusted.length, 1);
  store.addEvidence("0001", "counter-read", "disputes");
  assert.ok(store.allClaims()[0].disputed);
  const r = store.recall();
  assert.equal(r.trusted.length, 0); // withheld while disputed
  assert.equal(r.warnings.length, 1);
  store.resolveDispute("0001");
  assert.ok(!store.allClaims()[0].disputed);
  assert.equal(store.recall().trusted.length, 1); // trusted again
});

/* ---- decay ---- */
test("expired is stale and withheld", () => {
  const past = new Date(Date.now() - 86400000);
  const pastISO = `${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, "0")}-${String(past.getDate()).padStart(2, "0")}`;
  writeClaim("0001.md", { id: "0001", claim: "x", status: "verified", expires: pastISO });
  assert.ok(store.parseClaim(path.join(claims, "0001.md")).stale);
  assert.equal(store.recall().trusted.length, 0);
});

/* ---- vocabulary (so agents reuse existing names) ---- */
test("vocabulary", () => {
  writeClaim("0001.md", { id: "0001", claim: "a", status: "verified",
                          space: "Acme", market: "US", channel: "paid" });
  writeClaim("0002.md", { id: "0002", claim: "b", status: "verified",
                          space: "Finance", market: "FR", asset: "rates" });
  const v = store.vocabulary();
  assert.deepEqual(v.spaces.map((s: any) => s.name), ["Acme", "Finance"]);
  assert.deepEqual(v.tags.market, ["FR", "US"]);
  assert.deepEqual(Object.keys(v.tags).sort(), ["asset", "channel", "market"]);
});

/* ---- CRUD ---- */
test("set tags replaces only tags", () => {
  writeClaim("0001.md", { id: "0001", claim: "x", status: "verified",
                          market: "US", channel: "paid" });
  store.setTags("0001", { market: "FR", type: "pricing" });
  const c = store.parseClaim(path.join(claims, "0001.md"));
  assert.deepEqual(c.scope, { market: "FR", type: "pricing" });
  assert.equal(c.status, "verified"); // reserved field untouched
});

test("delete claim removes claim and events", () => {
  writeClaim("0001.md", { id: "0001", claim: "x", status: "verified" });
  store.appendEvent({ claim_id: "0001", type: "note", detail: "n" });
  store.appendEvent({ claim_id: "0002", type: "note", detail: "other" });
  assert.ok(store.deleteClaim("0001"));
  assert.ok(!fs.existsSync(path.join(claims, "0001.md")));
  const remaining = Object.values(store.loadEvents()).flat();
  assert.ok(remaining.every((e) => e.claim_id !== "0001"));
  assert.equal(store.allClaims().length, 0);
});

test("describe space", () => {
  store.describeSpace("Acme", "the Acme web app");
  assert.equal(store.spaceDescriptions()["Acme"], "the Acme web app");
  const entry = store.vocabulary().spaces.find((s: any) => s.name === "Acme");
  assert.deepEqual(entry, { name: "Acme", description: "the Acme web app" });
  store.describeSpace("Acme", ""); // clear
  assert.ok(!("Acme" in store.spaceDescriptions()));
});

/* ---- BM25 retrieval ---- */
test("recall bm25 ranks and drops non-matches", () => {
  writeClaim("0001.md", { id: "0001",
    claim: "Redis is the primary cache",
    status: "verified", market: "FR" });
  writeClaim("0002.md", { id: "0002", claim: "Redis powers session storage", status: "verified" });
  writeClaim("0003.md", { id: "0003", claim: "The build runs on CI", status: "verified" });
  const ids = store.recall("redis cache").trusted.map((t: any) => t.id);
  assert.equal(ids[0], "0001"); // hits both terms -> ranked first
  assert.ok(ids.includes("0002")); // shares 'redis'
  assert.ok(!ids.includes("0003")); // no overlap -> dropped
});

test("search bm25 orders by relevance", () => {
  writeClaim("0001.md", { id: "0001", claim: "cache cache cache page", status: "proposed" });
  writeClaim("0002.md", { id: "0002", claim: "a cache note", status: "proposed" });
  writeClaim("0003.md", { id: "0003", claim: "unrelated", status: "proposed" });
  assert.deepEqual(store.searchClaims("cache").map((h) => h.id), ["0001", "0002"]);
});

/* ---- bulk review ---- */
test("bulkSetStatus approves many, reports the changed count", () => {
  writeClaim("0001.md", { id: "0001", claim: "a", status: "proposed" });
  writeClaim("0002.md", { id: "0002", claim: "b", status: "proposed" });
  writeClaim("0003.md", { id: "0003", claim: "c", status: "proposed" });
  const n = store.bulkSetStatus(["0001", "0003", "9999"], "human-approved");
  assert.equal(n, 2); // 9999 doesn't exist
  const by = Object.fromEntries(store.allClaims().map((c) => [c.id, c.status]));
  assert.equal(by["0001"], "human-approved");
  assert.equal(by["0002"], "proposed"); // untouched
  assert.equal(by["0003"], "human-approved");
  assert.equal(store.recall().trusted.length, 2);
});

/* ---- write lock (concurrency) ---- */
test("concurrent creates get unique ids", async () => {
  // Node writers are sync + locked; hammer createClaim from interleaved microtasks.
  await Promise.all(Array.from({ length: 12 }, (_, i) =>
    Promise.resolve().then(() => store.createClaim(`claim ${i}`))));
  const ids = store.allClaims().map((c) => c.id);
  assert.equal(ids.length, 12);
  assert.equal(new Set(ids).size, 12); // the lock prevents duplicate-id races
});

test("concurrent appends keep all events", async () => {
  store.createClaim("base"); // 0001
  await Promise.all(Array.from({ length: 20 }, (_, i) =>
    Promise.resolve().then(() =>
      store.appendEvent({ claim_id: "0001", type: "note", detail: `n${i}`, at: "2026-01-01" }))));
  const notes = (store.loadEvents()["0001"] ?? []).filter((e) => e.type === "note");
  assert.equal(notes.length, 20); // no lost/torn appends
});
