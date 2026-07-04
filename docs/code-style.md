# Code style

The house style, derived from a reference backend
and adapted to a small MCP server + file store. Follow it for all new code.

## Modules & files

- **One class per file; ALL filenames are kebab-case** (`trust-rules.ts` →
  `class TrustRules`, `verifiers/mixpanel.ts` → `class MixpanelVerifier`).
  The class keeps its full PascalCase name; the filename never repeats the
  folder's context (`verifiers/mixpanel.ts`, not `verifiers/mixpanel-verifier.ts`
  — the folder already says "verifier").
- **Folders give the logical separation**; files stay small (one job, mostly
  under ~120 lines). The store is the template:
  `store/{infra,claims,spaces,writers,recall}/` — parsing, trust rules,
  repository, event log, each writer concern, ranking, views, queries, and the
  dashboard payload each live in their own class file.
- Shared types for a folder live in a `types.ts` inside that folder — **kept
  provider-agnostic**: contracts and shared shapes only. Provider-specific
  constants live in the provider's own file (`MIXPANEL_READONLY_TOOLS` lives
  in `verifiers/mixpanel.ts`).
- **No barrel `index.ts` files** internally — deep-import the concrete class
  file. Sanctioned exceptions: `errors/index.ts`, and modules whose path is a
  *published contract* (`store/index.ts` for tests/probe/npm consumers;
  back-compat shims like `verify.ts` and `verifiers/generic.ts`, marked
  "Re-export for backwards compatibility").
- `src/utils/` is **functions only** — zero classes, one concern per file,
  module-level JSDoc header, no barrel.

## Classes

- Named exports only; never `export default` for classes.
- Three instantiation flavors, chosen by state:
  - **Static-method class** for stateless logic (`TrustRules`,
    `ClaimRepository`, `RecallService`, `VerificationService`, `StoreLock`).
  - **Instance class + self-exported singleton** for pluggable providers:
    `export const genericVerifier = new GenericVerifier();` — consumers import
    the lowerCamelCase instance.
  - Cheap new-per-use when construction is trivial.
- **No abstract base classes for provider variants** — implementations share an
  **interface** (`IVerifier`), created only when ≥2 implementations exist.
  Contracts get the `I` prefix; plain data shapes are un-prefixed (`Verdict`).
- **Dispatch on data becomes a strategy registry** (Replace Conditional with
  Polymorphism): no `switch (kind)` or if-chains over magic field names.
  Each variant is a class implementing a contract, collected in a registry —
  adding a kind means adding a file, never editing a branch. Template:
  `verifiers/generic/` (READERS registry of `ICheckReader`, RULES list of
  `IExpectationRule`).
- Business services carry the `Service` suffix; infrastructure wrappers get
  descriptive names (`StoreLock`).
- Member order: static constants → public API → private helpers. Banner
  comments (`// ====== section ======`) group larger classes. `private`
  keyword, never `#`.
- **Static self-calls use the class name** (`ClaimRepository.claimFiles()`),
  not bare `this.` — the public facade re-exports statics as free functions,
  and a bare-`this` static breaks when detached.
- Explicit return types on all public methods.

## Errors

- One `AppError` with a **private constructor and static factories**
  (`AppError.notFound()`, `AppError.internal()`); `toJSON()` is the wire
  envelope (`{ error }` — the existing contract).
- Handlers **throw**; one normalizing catch at the top of the HTTP layer
  answers. Deep code (store, verifiers) throws plain `Error` — only the HTTP
  boundary speaks AppError.
- Best-effort verifier paths swallow errors and return `inconclusive`, always
  with a comment explaining why.

## Layers

- Verifiers implement `IVerifier` and import **only** `verifiers/types.ts` +
  stdlib + `utils/` — never anything under `store/`. Read-only by construction;
  `VerificationService.applyVerdict` is the single writer.
- The HTTP layer is plain modules (no controller classes); all responses go
  through the one `send()` responder. Entrypoints stay thin.
- HTTP endpoints are **data, not branches**: one row in `http/api-routes.ts`
  (method + path + handler function) per endpoint; `Router` matches in table
  order. Adding an endpoint = adding a row + a small named handler.
- Config-style values resolve at import time in one module (`store/paths.ts`);
  exception: verifier env vars (`MEMOTRUST_ALLOW_COMMAND_CHECKS`, `MIXPANEL_*`)
  are read at call time — tests toggle them per-test.

## Enums (closed vocabularies)

- A **closed set of related values used in logic** is an `enum`, never scattered
  string literals — statuses, effects, event types, verdict outcomes, check
  kinds, HTTP methods, CLI commands. No magic strings in dispatch or comparison.
- **Enum values equal the on-disk / wire token** (`Status.Verified = 'verified'`),
  so introducing an enum never changes a serialized byte. Fields parsed from
  disk stay typed `string` (files may be hand-edited); writers use the enum.
- Membership against an enum array uses the `isOneOf(MEMBERS, value)` guard, not
  a `string[]` cast. Lookup tables key on the enum
  (`Record<Outcome, Status>`, `{ [CheckKind.File]: … }`).
- Free-text `detail` / message strings are prose, not vocabulary — leave them.

## No magic values

- **Every meaningful literal is a named `UPPER_SNAKE` const** — timeouts (`*_MS`),
  TTLs, widths, caps, counts, tuning knobs (`DEFAULT_K1`), env-var names. Raw
  numbers/strings appear only inside the const's definition. Per-file knobs sit
  at the top of their file and feed default params (`k1 = DEFAULT_K1`).
- **Regexes are never inlined at a call site** — each is a named const stating
  what it matches (`FRONTMATTER_PATTERN`, `SPACE_LINE_PATTERN`, `TERM_PATTERN`).
  A `/m`-only (no `/g`) regex const is safe to reuse across `.test()`/`.replace()`.
- **One grammar, one owner.** The frontmatter split lives once in
  `ClaimParser.splitFrontmatter`; other code reuses it rather than re-declaring
  the `---` regex.
- **Idioms stay literal:** zero-padding a date field with `padStart(2, '0')` is
  self-evident and is left inline — naming it would add noise, not clarity.
- Free-text `detail` / message / label strings are prose, not vocabulary — not
  consts, not enums.

## Formatting

- Single quotes, semicolons, 2-space indent. Double quotes allowed for
  apostrophe-heavy literals (MCP tool descriptions).
- Imports: stdlib/third-party first, blank line, then internal (utils/errors →
  domain classes → types). ESM with `.js` suffixes.
- Module-level JSDoc header on every file. "Why" comments that document
  security reasoning or past bugs are load-bearing — never delete them.
- Logs: `console.error` at runtime (stdout carries the MCP protocol), with a
  bracketed PascalCase tag for new messages (`[StoreLock] …`).

## Tests & scripts

- Tests never touch real data (temp dir per test) and import the **published
  facades** — refactors must not require test edits.
- `scripts/` files carry a header with purpose + exact run command, and exit
  with explicit codes. `scripts/mcp-smoke-test.ts` (`npm run test:e2e`) is the
  acceptance contract: any implementation of the server must pass it unchanged.
