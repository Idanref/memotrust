/** The shapes agents receive — pure Claim → DTO mappers, no IO. */

import { Claim, Effect, Ev, isOneOf } from '../types.js';

/** Effects that count as a positive confirmation on the trail. */
const CONFIRMING_EFFECTS: readonly Effect[] = [Effect.Confirmed, Effect.Verified];

/** How many of the most recent confirmations a trusted view carries. */
const RECENT_CONFIRMATIONS_SHOWN = 2;

/** Maps a Claim to the compact shapes agents receive. */
export class ClaimViews {
  /** The compact shape an agent receives for a memory it may act on. */
  static trustedView(claim: Claim): Record<string, any> {
    const confirmations = (claim.evidence ?? [])
      .filter((event: Ev) => isOneOf(CONFIRMING_EFFECTS, event.effect))
      .map((event: Ev) => event.detail);

    return {
      id: claim.id,
      claim: claim.claim,
      status: claim.status,
      confidence: claim.confidence,
      scope: claim.scope,
      space: claim.space ?? null,
      last_confirmed: claim.last_confirmed ?? null,
      evidence: confirmations.slice(-RECENT_CONFIRMATIONS_SHOWN),
    };
  }

  /** A "don't repeat this" entry: the claim plus why it failed or is contested. */
  static warningView(claim: Claim): Record<string, any> {
    if (claim.disputed) {
      const latestDispute = [...(claim.evidence ?? [])].reverse()
        .find((event: Ev) => event.effect === Effect.Dispute);
      return { id: claim.id, do_not: claim.claim,
               why: 'DISPUTED — ' + (latestDispute?.detail ?? 'flagged as disputed') };
    }

    const disproof = (claim.evidence ?? []).find((event: Ev) => event.effect === Effect.Disproven);
    return { id: claim.id, do_not: claim.claim, why: disproof?.detail ?? claim.notes ?? '' };
  }
}
