/** The verifier contract — read-only by construction.
 *
 * A Verdict is the ONLY thing a verifier may produce. This module imports
 * nothing from the store and has no way to write, update, or delete anything.
 * Verifier classes import only this file + stdlib + utils/ — never anything
 * under store/ — so they are structurally incapable of mutating memory.
 * The single writer is VerificationService.applyVerdict.
 *
 * Everything in this file is provider-agnostic; provider-specific constants
 * live in the provider's own file (e.g. verifiers/mixpanel.ts).
 */

/** A verifier's ruling on a claim. */
export enum Outcome {
  Confirmed = 'confirmed',
  Refuted = 'refuted',
  Inconclusive = 'inconclusive',
}

/** The two built-in verifiers, by registry key. */
export enum VerifierName {
  Generic = 'generic',
  Mixpanel = 'mixpanel',
}

export interface Proof {
  read_by?: string;
  expected?: string;
  query?: Record<string, unknown>;
  result?: Record<string, unknown>;
  judged?: string;
}

/** The proof fields copied onto a verdict receipt, in receipt order.
 * Single source of truth for the audit-trail shape. */
export const PROOF_FIELDS = ['read_by', 'expected', 'query', 'result', 'judged'] as const;

/** A verifier's only output: the outcome plus its receipt. */
export interface Verdict {
  outcome: Outcome;
  detail: string;
  source: string;
  proof: Proof | null;
}

/** Runs a read-only query for a check and returns the observed value —
 * either the built-in live reader or an agent-submitted observation. */
export type Fetcher = (check: Record<string, any>) => Promise<any> | any;

/** The contract every pluggable verifier implements (registry-dispatched). */
export interface IVerifier {
  handles(claim: Record<string, any>): boolean;
  verify(claim: Record<string, any>, fetch?: Fetcher | null): Promise<Verdict>;
}

/** Shorthand factories for verdicts that carry no receipt. */
export const confirmed = (detail: string, source = ''): Verdict =>
  ({ outcome: Outcome.Confirmed, detail, source, proof: null });
export const refuted = (detail: string, source = ''): Verdict =>
  ({ outcome: Outcome.Refuted, detail, source, proof: null });
export const inconclusive = (detail: string, source = ''): Verdict =>
  ({ outcome: Outcome.Inconclusive, detail, source, proof: null });
