/** Judges a `{"contains": "…"}` expectation (case-insensitive). */

import { Expectation, IExpectationRule, Observation } from '../types.js';

/** Does the observed text contain the expected snippet? */
export class ContainsRule implements IExpectationRule {
  applies(check: Record<string, any>): boolean {
    return 'contains' in check;
  }

  evaluate(check: Record<string, any>, observation: Observation): Expectation {
    const found = observation.text.toLowerCase().includes(String(check.contains).toLowerCase());

    return {
      expected: `contains "${check.contains}"`,
      passed: found,
      observedSummary: found ? `found "${check.contains}"` : `"${check.contains}" not found`,
    };
  }
}
