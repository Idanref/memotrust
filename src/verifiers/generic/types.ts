/** The contracts behind the generic verifier: readers fetch, rules judge.
 * Adding a new check kind or expectation = adding a class, never a case. */

/** The sources a generic check can read from (the check's `kind` field). */
export enum CheckKind {
  File = 'file',
  Url = 'url',
  Command = 'command',
}

/** What a reader saw, normalized: always text, sometimes status/existence. */
export interface Observation {
  text: string;
  status?: unknown;
  exists?: boolean;
}

/** One judged expectation: what was expected, whether it held, what was seen. */
export interface Expectation {
  expected: string;
  passed: boolean;
  observedSummary: string;
}

/** A source a check can be read from (file, url, command, …). */
export interface ICheckReader {
  /** A human-readable name for where the reading comes from. */
  describeSource(check: Record<string, any>): string;

  /** Why this reader refuses to run right now, or null when it may. */
  rejectionReason?(check: Record<string, any>): string | null;

  /** Perform the read-only read and return the raw observation. */
  read(check: Record<string, any>): Promise<Record<string, any>> | Record<string, any>;
}

/** One kind of expectation a check can declare (exists, contains, …). */
export interface IExpectationRule {
  /** Does this check declare this expectation (and can it be judged)? */
  applies(check: Record<string, any>, observation: Observation): boolean;

  /** Judge the observation against the check's expectation. */
  evaluate(check: Record<string, any>, observation: Observation): Expectation;
}
