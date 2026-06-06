/** The trust rules — how a claim's state is interpreted.
 *
 * Pure functions over a Claim: staleness, the status a reader should see,
 * and whether a dispute is standing. This is the heart of the product;
 * nothing here touches the filesystem.
 */

import { todayISO } from '../../utils/dates.js';
import { AFFIRM_EFFECTS, AFFIRM_STATUSES, Claim, Effect, Ev, Status, isOneOf } from '../types.js';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Statuses whose confirmation can expire (decay applies only to earned trust). */
const EXPIRING_STATUSES: readonly Status[] = [Status.TestedConfirmed, Status.Verified];

/** Answers trust questions about a claim — pure logic, no filesystem. */
export class TrustRules {
  /** A trusted claim goes stale when its confirmation window has expired.
   * Claims that never earned trust can only be stale by explicit status. */
  static isStale(claim: Claim): boolean {
    const decayApplies = claim.expires && isOneOf(EXPIRING_STATUSES, claim.status);
    if (!decayApplies) return claim.status === Status.Stale;

    const expiresOnValidDate = ISO_DATE_PATTERN.test(claim.expires!);
    return expiresOnValidDate ? claim.expires! < todayISO() : false;
  }

  /** Whether a claim reads as stale to a consumer: it's past its window and it
   * had earned trust (a never-trusted 'proposed' claim is never "stale"). */
  static showsAsStale(claim: Claim): boolean {
    return Boolean(claim.stale) && claim.status !== Status.Proposed;
  }

  /** The status as shown: expired confirmations read as 'stale'. */
  static effStatus(claim: Claim): string {
    return TrustRules.showsAsStale(claim) ? Status.Stale : claim.status;
  }

  /** Disputed = a human flagged it (effect 'dispute') with no affirming event
   * (re-verify, re-confirm, or re-affirm) since. A trusted-but-contested claim is
   * withheld from agents until the dispute is resolved. */
  static isDisputed(claim: Claim): boolean {
    let lastDisputeIndex = -1;
    let lastAffirmIndex = -1;

    (claim.evidence ?? []).forEach((event, index) => {
      if (event.effect === Effect.Dispute) {
        lastDisputeIndex = index;
      } else if (TrustRules.isAffirming(event)) {
        lastAffirmIndex = index;
      }
    });

    return lastDisputeIndex > lastAffirmIndex;
  }

  /** An event that clears a standing dispute. */
  private static isAffirming(event: Ev): boolean {
    return isOneOf(AFFIRM_EFFECTS, event.effect)
        || isOneOf(AFFIRM_STATUSES, event.status);
  }
}
