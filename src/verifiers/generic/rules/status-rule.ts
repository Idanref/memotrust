/** Judges a `{"status": 200}` expectation against an observed HTTP status. */

import { Expectation, IExpectationRule, Observation } from '../types.js';

/** Did the source answer with the expected status code? */
export class StatusRule implements IExpectationRule {
  applies(check: Record<string, any>, observation: Observation): boolean {
    return 'status' in check && observation.status !== undefined;
  }

  evaluate(check: Record<string, any>, observation: Observation): Expectation {
    return {
      expected: `status = ${check.status}`,
      passed: Number(observation.status) === Number(check.status),
      observedSummary: `status = ${observation.status}`,
    };
  }
}
