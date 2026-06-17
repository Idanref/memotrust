/** memotrust MCP server — trust-aware memory for AI agents.
 *
 * Connect this to Claude Code / Codex / Cursor. Agents `recall` only verified,
 * in-scope, fresh knowledge (never unproven guesses), get warned about
 * approaches already disproven, and can `propose` new memories for human review.
 *
 * Reads/writes the same files as the web UI via store.ts — one source of truth.
 * The dashboard is started opportunistically alongside (first MCP process on
 * the machine wins the port; the rest just skip it).
 *
 * Run (stdio):  memotrust mcp   (or: npm run mcp)
 */

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { Status } from "./store/types.js";
import { startServer } from "./server.js";
import { ClaimWriter } from "./store/writers/claim-writer.js";
import { RecallService } from "./store/recall/recall-service.js";
import { SpaceDirectory } from "./store/spaces/space-directory.js";
import { VerificationService } from "./verifiers/verification-service.js";

const mcp = new McpServer({ name: "memotrust", version: "0.1.0" });

/** Wrap a value as an MCP text result (agents parse the JSON back). */
const json = (v: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(v) }] });

mcp.registerTool("recall", {
  description:
    "Recall trusted knowledge BEFORE you act or decide.\n\n" +
    "Returns only memories that have been verified or tested, are in scope, and " +
    "have not expired — never unproven guesses. Also returns `warnings` about " +
    "approaches that were already disproven, so you don't repeat a known failure. " +
    "Act only on the `trusted` list; treat `warnings` as things to avoid.\n\n" +
    "Args:\n" +
    "  query: Optional free text matched against the claim and its tags.\n" +
    "  scope: Optional tag filter, e.g. {\"market\": \"US\", \"channel\": \"paid\"}. " +
    "Tags are freeform — use whatever dimensions fit the domain.\n" +
    "  space: Optional space (top-level partition) to scope to, e.g. \"Acme\" " +
    "or \"Finance\". Pass the context you're working in.",
  inputSchema: {
    query: z.string().optional(),
    scope: z.record(z.string()).optional(),
    space: z.string().optional(),
  },
}, async ({ query, scope, space }) =>
  json(RecallService.recall(query ?? null, scope ?? {}, space ?? null)));

mcp.registerTool("vocabulary", {
  description:
    "The spaces and tags already in use. Call this BEFORE propose() and REUSE " +
    "existing names — don't invent `country` when `market` exists, or a new " +
    "\"acme\" space when \"Acme\" already does. Only add a new space or tag key " +
    "when nothing existing fits.\n\n" +
    "Returns {\"spaces\": [...], \"tags\": {key: [values...]}}.",
  inputSchema: {},
}, async () => json(RecallService.vocabulary()));

mcp.registerTool("propose", {
  description:
    "Propose a memory you learned, were told, or extracted from notes.\n\n" +
    "Stored as UNVERIFIED ('proposed') — NOT trusted until a human approves it or " +
    "evidence confirms it, so proposing never makes other agents treat it as fact. " +
    "Write a good claim: a short, declarative, *checkable* statement of something " +
    "durable (a finding or fact), not a transient detail. Call `vocabulary()` first " +
    "and reuse existing space and tag names so memory stays consistent.\n\n" +
    "Filing rules:\n" +
    "- If you're unsure which space a memory belongs to, leave `space` unset — " +
    "unfiled is safe and recoverable; a wrong space is a mis-file.\n" +
    "- If you file under a NEW space not in vocabulary() yet, also call " +
    "`describe_space` to give it a one-line description.\n\n" +
    "Use this to turn raw notes or a transcript into memory — extract each durable, " +
    "checkable fact as its own claim, tag it, and file it under the right space.\n\n" +
    "Args:\n" +
    "  claim: A short, declarative, checkable statement to remember.\n" +
    "  scope: Freeform tags, e.g. {\"market\": \"US\", \"channel\": \"paid\", \"type\": \"acquisition\"}.\n" +
    "  space: The space (top-level partition) to file under, e.g. \"Acme\".",
  inputSchema: {
    claim: z.string(),
    scope: z.record(z.string()).optional(),
    space: z.string().optional(),
  },
}, async ({ claim, scope, space }) => {
  const nid = ClaimWriter.createClaim(claim, scope ?? {}, "agent", space ?? null);
  return json({
    ok: true, id: nid, status: Status.Proposed,
    note: "Stored as proposed. Not trusted until a human approves it or a verifier confirms it.",
  });
});

mcp.registerTool("describe_space", {
  description:
    "Give a space a one-line description of what it is, so agents file and read " +
    "its memory correctly — e.g. describe_space(\"Acme\", \"the Acme web " +
    "app\"). Do this once, when a new space first appears.",
  inputSchema: { space: z.string(), description: z.string() },
}, async ({ space, description }) => json({ ok: SpaceDirectory.describeSpace(space, description) }));

mcp.registerTool("search", {
  description:
    "Search ALL memories by text, at any trust level.\n\n" +
    "Each result includes its status (tested, verified, proposed, stale, or " +
    "disproven) so you can judge how much to rely on it. Prefer `recall` when you " +
    "only want what is safe to act on.\n\n" +
    "Args:\n  query: Free text matched against claims and their scope.",
  inputSchema: { query: z.string() },
}, async ({ query }) => json(RecallService.searchClaims(query)));

mcp.registerTool("pending_verifications", {
  description:
    "List claims that carry a machine-checkable assertion and still need " +
    "verifying (proposed, externally-supported, or gone stale). Each item " +
    "includes its `check` describing exactly what to read. Use this, then read " +
    "the metric yourself (read-only, via your own connection), then call " +
    "submit_evidence with what you observed.",
  inputSchema: {},
}, async () => json(RecallService.pendingChecks()));

mcp.registerTool("submit_evidence", {
  description:
    "Verify a claim by submitting a reading you took READ-ONLY from a source " +
    "you can reach. memotrust compares your reading to the claim's expectation, " +
    "decides confirmed or refuted ITSELF, and records an auditable receipt — you " +
    "supply the number, you never decide the verdict.\n\n" +
    "Pass `observed` as the value you read: for a top-of-breakdown check, the top " +
    "label (e.g. 'US'); for a threshold check, the number as text (e.g. '1825').\n\n" +
    "Args:\n" +
    "  claim_id: The claim to verify (from pending_verifications).\n" +
    "  observed: What you read from the source.\n" +
    "  read_by: Your name (e.g. 'Claude Code'), recorded on the receipt.",
  inputSchema: {
    claim_id: z.string(),
    observed: z.union([z.string(), z.number()]),
    read_by: z.string().optional(),
  },
}, async ({ claim_id, observed, read_by }) =>
  json(await VerificationService.verifyWithObserved(claim_id, observed, read_by ?? "an agent")));

/** Serve MCP over stdio; bring the dashboard up too when the port is free. */
export async function startMcp(): Promise<void> {
  await startServer().catch(() => { /* another instance already serves it */ });
  await mcp.connect(new StdioServerTransport());
}
