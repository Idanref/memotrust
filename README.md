<div align="center">

<img src="assets/memotrust-icon.png" alt="memotrust" width="132" />

# memotrust

### Your agents remember only what's *true*.

**Verified memory for AI agents.** Agents propose memories — evidence verifies them.
`recall()` returns only what has *earned* trust, so a hallucinated, stale, or
**poisoned** "fact" never reaches your other agents.

<br/>

<img src="assets/demo/demo.gif" alt="An agent proposes memories; a poisoned card is caught at the gate while verified memory flows to every agent." width="760" />

<br/>

`npx memotrust install`

</div>

---

## The problem with agent memory

Giving agents a shared memory is a superpower — until it isn't. Every other memory
layer **trusts whatever the agent writes.** So the moment one agent hallucinates a
fact, copies a stale number, or reads a poisoned note, that mistake becomes *every*
agent's "truth" — silently, and forever.

That's not a rough edge. It's an attack surface (memory poisoning is OWASP agentic
risk **ASI06**) and a correctness bug (agents confidently repeat their own guesses).

## memotrust flips the default

> **Nothing is trusted on arrival.** A memory reaches `recall()` only after
> deterministic verification against a real source, or explicit human approval.
> Trust decays. Disputes withhold. Every verdict keeps an auditable receipt.

- 🛡️ **Poison can't spread** — unverified memories are quarantined, never served. One agent's bad note can't become another agent's fact.
- ✅ **Only earned trust is recalled** — `recall()` returns verified, fresh, in-scope memory, ranked. No guesses, no stale wins.
- ⚠️ **Failures come back as warnings** — approaches already disproven return as warnings, so agents don't repeat a known dead end.
- 🧾 **Receipts, not vibes** — every verdict records the query, the reading, and the judgment. You can audit *why* anything is trusted.
- 📂 **Just files** — Markdown claims + an append-only JSONL log, git-backed. Human-readable, diffable, tamper-evident. No database.

## Quick start

```bash
npx memotrust install     # create the store, git-init it, register the MCP with your agent
```

That's it. Point Claude Code, Cursor, or any MCP client at it and your agents can
`propose` and `recall`. The dashboard rides along at **http://localhost:8765**.

<sub>From a checkout instead: `npm install && npx tsx src/cli.ts install`. Memory location resolves `MEMOTRUST_HOME` › a checkout's own `memory/` › `~/.memotrust`.</sub>

## How it works

```
agent ──propose()──► [ proposed · quarantined ]
                            │
             evidence ──► store judges ──► receipt      (or a human approves)
                            │
                     [ trusted ]──recall()──► agents act on it
                            │
              60-day decay / human dispute ──► withheld again
```

- **The agent is the extractor** — there is no LLM inside the store. Your agent extracts durable facts and proposes them over MCP.
- **The store is the judge.** To verify, the agent only ever *reads* a source and submits the observation; memotrust compares it to the claim's expectation, decides confirmed/refuted itself, and records the receipt. **An agent cannot fake a verdict.**

## memotrust vs. a plain memory layer

| | plain memory | **memotrust** |
|---|---|---|
| New memory is… | trusted immediately | **quarantined until verified** |
| Hallucinated / poisoned note | served to every agent | **withheld — never recalled** |
| Stale facts | linger and win | **decay after 60 days, re-verify** |
| "We already tried that" | forgotten | **returned as a warning** |
| Why is this trusted? | ¯\\\_(ツ)\_/¯ | **an auditable receipt** |

## The tools your agent gets

| Tool | What it does |
|---|---|
| `recall` | Only trusted + fresh + in-scope memory, ranked; disproven approaches come back as warnings |
| `propose` | File a new memory — lands quarantined, never trusted on arrival |
| `vocabulary` | Existing spaces + tags, so agents reuse names instead of inventing synonyms |
| `describe_space` | One-line description when a new space first appears |
| `search` | Everything at any trust level, each result labeled with its status |
| `pending_verifications` | Claims with machine-checkable assertions awaiting a reading |
| `submit_evidence` | Submit a read-only observation — the store judges, not the agent |

## Verification

**Built-in, zero credentials** — a claim opts in with a `check` in its frontmatter:

```yaml
check: {"kind": "file", "path": "package.json", "contains": "pnpm"}
check: {"kind": "url",  "url": "https://api.example.com/health", "status": 200}
check: {"kind": "command", "run": "node --version", "contains": "v22"}
```

`command` checks are **disabled by default** — a poisoned claim must never become
code execution from a human's verify click. Opt in with
`MEMOTRUST_ALLOW_COMMAND_CHECKS=1` (runs without a shell; pipes and redirects in a
check are inert strings).

**Connected sources** (optional) — e.g. the Mixpanel verifier confirms growth
claims against live analytics through a read-only service account. Copy
[.env.example](.env.example) to `.env` and fill in read-scoped credentials.

## Dashboard

`npm run serve` (it also rides along whenever an agent connects). Review the inbox
(approve/reject, in bulk), watch trust coverage, audit any claim's full evidence
chain and receipts, and dispute anything that looks wrong.

## Development

```bash
npm test                     # store + verifier unit tests
npm run test:e2e             # end-to-end MCP smoke test (8 checks, real stdio, hermetic)
npm run typecheck
npm run build                # compile to dist/
```

`scripts/mcp-smoke-test.ts` (`npm run test:e2e`) speaks real MCP over stdio against a
throwaway store and must pass against any implementation — it's the acceptance contract.

## Docs

- [docs/features.md](docs/features.md) — what makes it different
- [docs/code-style.md](docs/code-style.md) — the house style the codebase holds to

## License

[MIT](LICENSE)
