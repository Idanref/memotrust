/** Human-written evidence on a claim's trail: context notes, support,
 * disputes, and the affirmation that settles a dispute. Never changes a
 * status — trust is earned only through verification or explicit approval. */

import { todayISO } from '../../utils/dates.js';
import { EventLog } from '../claims/event-log.js';
import { StoreLock } from '../infra/store-lock.js';
import { Effect, EventType, EvidenceKind } from '../types.js';
import { ClaimRepository } from '../claims/claim-repository.js';

/** Which effect each note kind records; anything else is plain context. */
const EFFECT_BY_KIND: Record<string, Effect> = {
  [EvidenceKind.Supports]: Effect.Support,
  [EvidenceKind.Disputes]: Effect.Dispute,
};

/** Appends human notes, disputes, and affirmations to a claim's trail. */
export class EvidenceWriter {
  /** Append a human-written evidence/context note to a claim's trail. */
  static addEvidence(claimId: string, text: string,
                     kind: string = EvidenceKind.Context, by = 'you'): boolean {
    return StoreLock.withLock(() => {
      const noteText = (text ?? '').trim();
      if (!noteText) return false;
      if (!ClaimRepository.findClaimFile(claimId)) return false;

      EventLog.appendEvent({
        claim_id: claimId,
        type: EventType.Note,
        detail: noteText,
        by,
        at: todayISO(),
        effect: EFFECT_BY_KIND[kind] ?? Effect.Context,
      });

      return true;
    });
  }

  /** Clear a dispute by appending an affirming event. Append-only — the dispute
   * note stays in the trail. */
  static resolveDispute(claimId: string, by = 'you'): boolean {
    return StoreLock.withLock(() => {
      if (!ClaimRepository.findClaimFile(claimId)) return false;

      EventLog.appendEvent({
        claim_id: claimId,
        type: EventType.Verdict,
        effect: Effect.Affirmed,
        detail: 'dispute reviewed — re-affirmed',
        by,
        at: todayISO(),
      });

      return true;
    });
  }
}
