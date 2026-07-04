# memotrust.ai — what it is and why it's different

**Verified memory for AI agents.** Agents propose, evidence verifies. A memory
is trusted only when it's been earned — never because a model said so.

## The core difference

Most AI memory stores whatever the model extracted and trusts it by default — so
a hallucination quietly becomes a "fact" your agents act on. memotrust flips it:
every memory starts **unverified** and becomes trusted only through verification
or human approval. You get memory an agent can **cite**, not memory that might be
made up.

## Standout properties

- **A weak agent can't poison your trusted memory.** Nothing an agent extracts is
  trusted on arrival — it lands as *proposed*. A sloppy agent that mis-parses or
  invents claims just produces unverified junk that's withheld from recall; it
  can never reach the trusted list an agent acts on. Worst case is noise in the
  waiting room, never a corrupted answer. It degrades gracefully: a weaker agent
  earns less trust, it doesn't poison what's already earned.

- **The agent can't fake a verdict.** During verification the agent only *reads*
  the source; memotrust does the confirm/refute comparison itself and records an
  auditable **receipt** — the exact query and the exact result. You can always
  see *why* something is trusted, and challenge it.

- **Trust decays.** A confirmation isn't forever. Memories expire and are withheld
  until re-verified, so agents never act on a fact that quietly went stale.

- **Disputes are first-class.** Flag a trusted claim and it's instantly withheld
  from agents (and surfaced as a warning) until it's re-verified or re-affirmed —
  append-only, so the whole arc stays on the record.

- **Recall returns only what's safe to act on.** Trusted + fresh + in-scope, with
  the noise withheld — cleaner context and fewer tokens, not a dump of everything
  ever said.

- **Local-first and git-backed.** Memory is plain files in *your* repo —
  diffable, auditable, portable. Your data stays yours; no vendor cloud.

## Features

- **Spaces** — partition memory by domain (apps, finance, personal) so it scales
  across everything you do; recall is scoped to the space you're working in.
- **Open tags** — facets emerge from your data, not a fixed schema; the filters
  adapt to whatever domain you're in.
- **Agent view** — see exactly what an agent gets back from `recall()`: the
  trusted list, the warnings, and the count of what's withheld.
- **Read-only verifiers** — connect sources (Mixpanel, RevenueCat, GitHub…) that
  can confirm a claim but structurally cannot write, update, or delete anything.
- **Contradiction surfacing** — claims sharing a scope are shown side by side, so
  two agents believing opposite things gets caught.
- **Trust coverage at a glance** — how much of your memory is trusted vs stale vs
  contested vs unproven.
- **Agent-native** — an MCP server for Claude Code / Cursor / Codex: agents
  `recall`, `propose`, and `submit_evidence` directly.
