/** Generic verifiers — READ-ONLY, zero credentials, work out of the box.
 *
 * Dev-agent memories are the checkable kind: "the repo uses pnpm", "the docs
 * page is live", "the endpoint answers". These checks verify them against the
 * filesystem and the network with no accounts and no keys. Imports the
 * verifier contract and the standard library only — never store/ — so it
 * cannot mutate memory.
 *
 * A claim opts in via its `check` frontmatter:
 *   {"kind": "file", "path": "package.json", "contains": "pnpm"}
 *   {"kind": "file", "path": "docs/vision.md", "exists": true}
 *   {"kind": "url",  "url": "https://memotrust.ai", "status": 200, "contains": "verified"}
 *   {"kind": "command", "run": "node --version", "contains": "v22"}   // opt-in only
 *
 * Extension works by adding classes, never branches: each check kind is an
 * ICheckReader in the READERS registry, each expectation an IExpectationRule
 * in the RULES list (see generic/). The security gate for command checks
 * lives inside CommandReader.
 */

import { EqualsRule } from './generic/rules/equals-rule.js';
import { ExistsRule } from './generic/rules/exists-rule.js';
import { StatusRule } from './generic/rules/status-rule.js';
import { UrlReader } from './generic/readers/url-reader.js';
import { FileReader } from './generic/readers/file-reader.js';
import { ContainsRule } from './generic/rules/contains-rule.js';
import { CommandReader } from './generic/readers/command-reader.js';
import { Fetcher, IVerifier, Outcome, Verdict, inconclusive } from './types.js';
import { CheckKind, Expectation, ICheckReader, IExpectationRule, Observation } from './generic/types.js';

/** Longest observed-text snippet copied into a verdict's proof.result. */
const PROOF_SNIPPET_LENGTH = 200;

/** check.kind -> how to read that source. Adding a kind = adding a reader. */
const READERS: Record<string, ICheckReader> = {
  [CheckKind.File]: new FileReader(),
  [CheckKind.Url]: new UrlReader(),
  [CheckKind.Command]: new CommandReader(),
};

/** The expectations a check may declare, judged in this order. */
const RULES: IExpectationRule[] = [
  new ExistsRule(),
  new StatusRule(),
  new ContainsRule(),
  new EqualsRule(),
];

/** Verifies claims against files, URLs, and (opt-in) commands — no credentials. */
export class GenericVerifier implements IVerifier {
  /** Handles any claim whose check declares a known kind. */
  handles(claim: Record<string, any>): boolean {
    const rawCheck = claim?.check;
    if (!rawCheck) return false;

    try {
      const check = typeof rawCheck === 'string' ? JSON.parse(rawCheck) : rawCheck;
      return Object.hasOwn(READERS, check?.kind ?? '');
    } catch {
      return false;
    }
  }

  /** Read the source (or take the agent's reading), then judge it. */
  async verify(claim: Record<string, any>, fetch?: Fetcher | null): Promise<Verdict> {
    let check: Record<string, any>;
    try {
      check = typeof claim.check === 'string' ? JSON.parse(claim.check) : claim.check;
    } catch {
      return inconclusive("claim's check is not valid JSON", 'generic verifier');
    }

    const reader = Object.hasOwn(READERS, check.kind ?? '') ? READERS[check.kind] : undefined;
    const source = reader?.describeSource(check) ?? 'generic verifier';
    const readBy = check.read_by ?? 'memotrust';

    // a reader may refuse to run (e.g. the command-check security gate)
    const rejection = reader?.rejectionReason?.(check);
    if (rejection) return inconclusive(rejection, source);

    const read = fetch ?? ((c: Record<string, any>) => {
      if (!reader) throw new Error(`unknown check kind: ${c.kind}`);
      return reader.read(c);
    });

    let observed: any;
    try {
      observed = await read(check);
    } catch (error: any) { // a read failure is inconclusive, never a crash
      return inconclusive(`could not read the source: ${error?.message ?? error}`, source);
    }

    return this.judge(check, observed, source, readBy);
  }

  /** Decide confirmed/refuted: every declared expectation must hold. */
  private judge(check: Record<string, any>, observed: any,
                source: string, readBy: string): Verdict {
    const label = check.label ?? check.kind;
    const observation = this.normalize(observed);

    const expectations: Expectation[] = RULES
      .filter((rule) => rule.applies(check, observation))
      .map((rule) => rule.evaluate(check, observation));
    if (!expectations.length) {
      return inconclusive('check declares no expectation (exists/status/contains/equals)', source);
    }

    const allPassed = expectations.every((expectation) => expectation.passed);
    const expected = expectations.map((expectation) => expectation.expected).join(' AND ');
    const judged = expectations.map((expectation) => expectation.observedSummary).join('; ')
      + `  ${allPassed ? '==' : '!='}  expected`;

    const result: Record<string, any> = {};
    if (observation.status !== undefined) result.status = observation.status;
    if (observation.exists !== undefined) result.exists = observation.exists;
    if (observation.text) result.observed = observation.text.slice(0, PROOF_SNIPPET_LENGTH);

    return {
      outcome: allPassed ? Outcome.Confirmed : Outcome.Refuted,
      detail: `${label}: ${judged}`,
      source,
      proof: { read_by: readBy, expected, query: this.describeQuery(check, source), result, judged },
    };
  }

  /** Normalize whatever was observed into { text, status?, exists? }. */
  private normalize(observed: any): Observation {
    if (typeof observed === 'object' && observed !== null) {
      return { text: String(observed.text ?? ''), status: observed.status, exists: observed.exists };
    }

    return { text: String(observed) };
  }

  /** The auditable "query the reader ran" part of the receipt. */
  private describeQuery(check: Record<string, any>, source: string): Record<string, any> {
    const query: Record<string, any> = { kind: check.kind };
    for (const field of ['path', 'url', 'run']) {
      if (check[field]) query[field] = check[field];
    }
    query.source = source;
    return query;
  }
}

export const genericVerifier = new GenericVerifier();

// ====== back-compat module API (the published path for tests) ======

/** Re-export for backwards compatibility — instance methods need `this`, so
 * these delegate with arrows. New code uses the class / singleton above. */
export const handles = (claim: Record<string, any>): boolean => genericVerifier.handles(claim);
export const verify = (claim: Record<string, any>, fetch?: Fetcher | null): Promise<Verdict> =>
  genericVerifier.verify(claim, fetch);
