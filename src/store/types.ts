/** The trust model's shapes and constants — no IO, no dependencies.
 *
 * The enums below are the store's closed vocabularies. Their string values
 * are the exact tokens written to disk (frontmatter + events.jsonl), so the
 * enums replace magic strings in code without changing a single byte on disk. */

export const DECAY_DAYS = 60;

/** A claim's lifecycle state, as written in its `status:` frontmatter line. */
export enum Status {
  Proposed = 'proposed',
  Supported = 'supported',
  Verified = 'verified',
  TestedConfirmed = 'tested-confirmed',
  HumanApproved = 'human-approved',
  Disproven = 'disproven',
  TestedFailed = 'tested-failed',
  Rejected = 'rejected',
  Stale = 'stale',
}

/** How much a claim's confidence is rated (the `confidence:` line). */
export enum Confidence {
  None = 'none',
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

/** What an event did to its claim (the event's `effect` field). */
export enum Effect {
  Proposed = 'proposed',
  Support = 'support',
  Dispute = 'dispute',
  Context = 'context',
  Confirmed = 'confirmed',
  Verified = 'verified',
  Affirmed = 'affirmed',
  Disproven = 'disproven',
  Checked = 'checked',
}

/** The kind of an event (the event's `type` field). */
export enum EventType {
  Proposed = 'proposed',
  Verdict = 'verdict',
  Note = 'note',
  Verifier = 'verifier',
}

/** The kind of human note the composer sends (maps to an Effect). */
export enum EvidenceKind {
  Context = 'context',
  Supports = 'supports',
  Disputes = 'disputes',
}

/** Frontmatter keys owned by the store; everything else is a freeform tag. */
export const RESERVED = ['id', 'claim', 'status', 'confidence', 'created',
  'last_confirmed', 'expires', 'proposed_by', 'check', 'space'] as const;

/** The only statuses recall() will ever return. */
export const TRUSTED: readonly Status[] =
  [Status.TestedConfirmed, Status.Verified, Status.HumanApproved];

/** Kept, never recalled as fact — returned as warnings. */
export const DISPROVEN: readonly Status[] = [Status.Disproven, Status.TestedFailed];

/** Events/statuses that clear a standing dispute. */
export const AFFIRM_EFFECTS: readonly Effect[] =
  [Effect.Confirmed, Effect.Verified, Effect.Affirmed];
export const AFFIRM_STATUSES: readonly Status[] =
  [Status.TestedConfirmed, Status.Verified, Status.HumanApproved];

/** Is this frontmatter key owned by the store (i.e. not a freeform tag)? */
export const isReserved = (key: string): boolean =>
  (RESERVED as readonly string[]).includes(key);

/** Does this enum contain the given value? (safe closed-set membership test.) */
export function isOneOf<T extends string>(members: readonly T[], value: unknown): value is T {
  return members.includes(value as T);
}

/** One event on the append-only trail. Core fields are stable; verifier
 * receipts add proof fields (query, result, judged, read_by, expected).
 * Fields are read-tolerant `string`s (files may be hand-edited); writers use
 * the enums above. */
export interface Ev {
  claim_id?: string;
  type?: string;
  effect?: string;
  status?: string;
  by?: string;
  at?: string;
  ts?: string;
  detail?: string;
  source?: string;
  [extra: string]: any;
}

/** A parsed claim: frontmatter is the current state, `scope` holds every
 * non-reserved key as a freeform tag, `evidence` the ordered event trail. */
export interface Claim {
  id: string;
  claim: string;
  status: string;
  confidence: string;
  scope: Record<string, string>;
  created: string | null;
  last_confirmed: string | null;
  expires: string | null;
  proposed_by: string | null;
  check: string | null;
  space: string | null;
  notes: string;
  stale?: boolean;
  disputed?: boolean;
  evidence?: Ev[];
  [extra: string]: any;
}
