/** Back-compat facade over verifiers/VerificationService.ts — the published
 * module path for tests and external callers. New code imports the class. */

import { VerificationService } from './verifiers/verification-service.js';

export { VerificationService } from './verifiers/verification-service.js';
export type { Fetcher, IVerifier, Proof, Verdict } from './verifiers/types.js';

// Re-export for backwards compatibility
export const REGISTRY = VerificationService.REGISTRY;
export const verifierFor = VerificationService.verifierFor;
export const runVerifier = VerificationService.runVerifier;
export const applyVerdict = VerificationService.applyVerdict;
export const verifyWithObserved = VerificationService.verifyWithObserved;
