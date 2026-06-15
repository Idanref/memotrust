/** Verifier orchestration — the ONLY place a verdict touches memory.
 *
 * Read-only by construction:
 *   • Verifier classes (GenericVerifier, MixpanelVerifier, …) implement
 *     IVerifier and import only the contract + stdlib, never store/. They
 *     reach external systems through read-only operations and return a
 *     Verdict. They cannot write/update/delete anything.
 *   • `applyVerdict` below is the single writer. It turns a verdict into one
 *     evidence event plus a status change. A verifier has no reference to it
 *     and cannot call it to smuggle a write — it only returns data.
 */

import { todayISO } from '../utils/dates.js';
import { genericVerifier } from './generic.js';
import { mixpanelVerifier } from './mixpanel.js';
import { EventLog } from '../store/claims/event-log.js';
import { StoreLock } from '../store/infra/store-lock.js';
import { Effect, EventType, Status } from '../store/types.js';
import { StatusWriter } from '../store/writers/status-writer.js';
import { ClaimRepository } from '../store/claims/claim-repository.js';
import { Fetcher, IVerifier, Outcome, PROOF_FIELDS, Verdict, VerifierName } from './types.js';

/** Routes claims to verifiers and is the single writer of verdicts. */
export class VerificationService {
  // name -> verifier (each implements IVerifier). Insertion order is routing
  // precedence: an explicit check.kind always outranks type-based routing.
  static readonly REGISTRY: Record<string, IVerifier> = {
    [VerifierName.Generic]: genericVerifier,
    [VerifierName.Mixpanel]: mixpanelVerifier,
  };

  /** How a decisive verdict lands on the claim (inconclusive changes nothing). */
  private static readonly STATUS_BY_OUTCOME: Partial<Record<Outcome, Status>> =
    { [Outcome.Confirmed]: Status.Verified, [Outcome.Refuted]: Status.Disproven };
  private static readonly EFFECT_BY_OUTCOME: Partial<Record<Outcome, Effect>> =
    { [Outcome.Confirmed]: Effect.Verified, [Outcome.Refuted]: Effect.Disproven };

  /** The first registered verifier that recognizes this claim. */
  static verifierFor(claim: Record<string, any>): [string, IVerifier] | [null, null] {
    for (const [name, verifier] of Object.entries(VerificationService.REGISTRY)) {
      if (verifier.handles(claim)) return [name, verifier];
    }

    return [null, null];
  }

  /** Find a claim, run its read-only verifier. If apply, record the verdict; if
   * not (a dry re-run), just return the outcome + proof without changing anything. */
  static async runVerifier(claimId: string, fetch: Fetcher | null = null,
                           apply = true): Promise<Record<string, any>> {
    const claim = ClaimRepository.allClaims().find((candidate) => candidate.id === claimId);
    if (!claim) return { ok: false, error: 'claim not found' };

    const [name, verifier] = VerificationService.verifierFor(claim);
    if (!verifier) return { ok: false, error: 'no read-only verifier handles this claim' };

    const verdict = await verifier.verify({ ...claim }, fetch); // a copy; verifier cannot mutate it
    if (apply) VerificationService.applyVerdict(claimId, name!, verdict);

    return { ok: true, verifier: name, outcome: verdict.outcome,
             detail: verdict.detail, source: verdict.source, proof: verdict.proof };
  }

  /** The single writer: one evidence event carrying the audit proof, plus a
   * status change if the verdict is decisive. */
  static applyVerdict(claimId: string, verifierName: string, verdict: Verdict): void {
    const newStatus = VerificationService.STATUS_BY_OUTCOME[verdict.outcome];
    const effect = VerificationService.EFFECT_BY_OUTCOME[verdict.outcome] ?? Effect.Checked;

    const receipt: Record<string, any> = {
      claim_id: claimId,
      type: EventType.Verifier,
      source: verifierName,
      detail: verdict.detail,
      by: `${verifierName} verifier`,
      at: todayISO(),
      effect,
    };
    if (verdict.proof) {
      for (const field of PROOF_FIELDS) {
        receipt[field] = (verdict.proof as any)[field];
      }
    }

    StoreLock.withLock(() => { // status change + receipt land as one atomic unit
      if (newStatus) StatusWriter.writeStatus(claimId, newStatus);
      EventLog.appendEvent(receipt);
    });
  }

  /** An agent submits a reading it took (read-only) from a source it can reach.
   * memotrust compares the reading to the claim's check, decides the verdict
   * ITSELF, and records the audit receipt. The agent supplies the data; it
   * never decides what's true. */
  static async verifyWithObserved(claimId: string, observed: any,
                                  readBy = 'an agent'): Promise<Record<string, any>> {
    const claim = ClaimRepository.allClaims().find((candidate) => candidate.id === claimId);
    if (!claim) return { ok: false, error: 'claim not found' };
    if (!claim.check) return { ok: false, error: 'claim has no machine-checkable assertion' };

    const [name, verifier] = VerificationService.verifierFor(claim);
    if (!verifier) return { ok: false, error: 'no verifier handles this claim' };

    // thread read_by into the check so it lands on the receipt
    const claimCopy = { ...claim };
    let parsedCheck: Record<string, any>;
    try {
      parsedCheck = typeof claimCopy.check === 'string'
        ? JSON.parse(claimCopy.check)
        : { ...(claimCopy.check ?? {}) };
    } catch {
      parsedCheck = {};
    }
    parsedCheck.read_by = readBy;
    claimCopy.check = JSON.stringify(parsedCheck);

    const verdict = await verifier.verify(claimCopy, () => observed); // the agent's reading
    VerificationService.applyVerdict(claimId, name!, verdict);

    return { ok: true, verifier: name, outcome: verdict.outcome, detail: verdict.detail };
  }
}
