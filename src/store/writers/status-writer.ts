/** Status transitions — the only writer allowed to change what a claim IS.
 * Granting trust also refreshes the decay horizon. */

import * as fs from 'node:fs';

import { EventLog } from '../claims/event-log.js';
import { StoreLock } from '../infra/store-lock.js';
import { plusDaysISO, todayISO } from '../../utils/dates.js';
import { ClaimRepository } from '../claims/claim-repository.js';
import { DECAY_DAYS, EventType, Ev, Status, isOneOf } from '../types.js';

/** Statuses a human or verifier can grant that count as earned trust. */
const TRUST_GRANTING_STATUSES: readonly Status[] =
  [Status.TestedConfirmed, Status.Verified, Status.HumanApproved];

/** Frontmatter lines this writer replaces or inserts after (all `/m`, no `/g`,
 * so they're safe to reuse across `.test()` and `.replace()`). */
const STATUS_LINE_PATTERN = /^status:.*$/m;
const STATUS_LINE_CAPTURE_PATTERN = /^(status:.*)$/m;
const LAST_CONFIRMED_LINE_PATTERN = /^last_confirmed:.*$/m;
const LAST_CONFIRMED_PRESENT_PATTERN = /^last_confirmed:/m;
const EXPIRES_LINE_PATTERN = /^expires:.*$/m;
const EXPIRES_PRESENT_PATTERN = /^expires:/m;

/** Changes what a claim IS — the only writer allowed to touch status. */
export class StatusWriter {
  /** Rewrite a claim's status in its file (no event). Bumps freshness if trusted. */
  static writeStatus(claimId: string, status: string): boolean {
    return StoreLock.withLock(() => {
      const claimFile = ClaimRepository.findClaimFile(claimId);
      if (!claimFile) return false;

      let contents = fs.readFileSync(claimFile, 'utf-8');
      contents = contents.replace(STATUS_LINE_PATTERN, `status: ${status}`);

      if (isOneOf(TRUST_GRANTING_STATUSES, status)) {
        contents = StatusWriter.bumpFreshness(contents);
      }

      StoreLock.atomicWrite(claimFile, contents);
      return true;
    });
  }

  /** Rewrite a claim's status and append an evidence event. */
  static setStatus(claimId: string, status: string, note = '',
                   by = 'you', eventType: string = EventType.Verdict,
                   effect: string | null = null): boolean {
    return StoreLock.withLock(() => {
      if (!StatusWriter.writeStatus(claimId, status)) return false;

      const event: Ev = {
        claim_id: claimId,
        type: eventType,
        status,
        by,
        at: todayISO(),
        detail: note || `marked ${status}`,
      };
      if (effect) event.effect = effect;

      EventLog.appendEvent(event);
      return true;
    });
  }

  /** Set one status across many claims (inbox bulk review). Returns how many
   * actually changed; the whole batch lands under one lock hold. */
  static bulkSetStatus(ids: string[], status: string, note = ''): number {
    return StoreLock.withLock(() => {
      let changedCount = 0;

      for (const id of ids ?? []) {
        if (StatusWriter.setStatus(String(id), status, note)) changedCount++;
      }

      return changedCount;
    });
  }

  /** Refresh last_confirmed and push the decay horizon out from today. */
  private static bumpFreshness(contents: string): string {
    const today = todayISO();

    if (LAST_CONFIRMED_PRESENT_PATTERN.test(contents)) {
      contents = contents.replace(LAST_CONFIRMED_LINE_PATTERN, `last_confirmed: ${today}`);
    } else {
      contents = contents.replace(STATUS_LINE_CAPTURE_PATTERN, `$1\nlast_confirmed: ${today}`);
    }

    if (EXPIRES_PRESENT_PATTERN.test(contents)) {
      contents = contents.replace(EXPIRES_LINE_PATTERN, `expires: ${plusDaysISO(DECAY_DAYS)}`);
    }

    return contents;
  }
}
