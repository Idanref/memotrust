/** Judges an `{"equals": "…"}` expectation (exact match, trimmed). */

import { Expectation, IExpectationRule, Observation } from '../types.js';

/** Longest observed value echoed back in the equals-rule summary. */
const SUMMARY_SNIPPET_LENGTH = 60;

/** Is the observed text exactly the expected value? */
export class EqualsRule implements IExpectationRule {
  applies(check: Record<string, any>): boolean {
    return 'equals' in check;
  }

  evaluate(check: Record<string, any>, observation: Observation): Expectation {
    const matches = observation.text.trim() === String(check.equals).trim();

    return {
      expected: `equals "${check.equals}"`,
      passed: matches,
      observedSummary: `read "${observation.text.trim().slice(0, SUMMARY_SNIPPET_LENGTH)}"`,
    };
  }
}
