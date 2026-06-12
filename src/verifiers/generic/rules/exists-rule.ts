/** Judges an `{"exists": true|false}` expectation. */

import { Expectation, IExpectationRule, Observation } from '../types.js';

/** Did the source exist (or, lacking a flag, did it have any content)? */
export class ExistsRule implements IExpectationRule {
  applies(check: Record<string, any>): boolean {
    return 'exists' in check;
  }

  evaluate(check: Record<string, any>, observation: Observation): Expectation {
    const observedExists = observation.exists ?? observation.text !== '';

    return {
      expected: `exists = ${check.exists}`,
      passed: observedExists === Boolean(check.exists),
      observedSummary: `exists = ${observedExists}`,
    };
  }
}
