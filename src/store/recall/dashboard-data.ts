/** Assembles everything the web dashboard needs in one payload. */

import * as fs from 'node:fs';

import { paths } from '../paths.js';
import { Ev, Status } from '../types.js';
import { todayISO } from '../../utils/dates.js';
import { EventLog } from '../claims/event-log.js';
import { TrustRules } from '../claims/trust-rules.js';
import { SpaceDirectory } from '../spaces/space-directory.js';
import { ClaimRepository } from '../claims/claim-repository.js';

/** Builds the single payload the web dashboard renders from. */
export class DashboardData {
  /** Everything the dashboard needs: claims, counts, spaces, live status. */
  static buildData(): Record<string, any> {
    const claims = ClaimRepository.allClaims();

    // two stable sorts: staleness first, then what-needs-attention order
    const attentionOrder: Record<string, number> =
      { [Status.Proposed]: 0, [Status.TestedFailed]: 1, [Status.Disproven]: 1 };
    claims.sort((left, right) =>
      (TrustRules.showsAsStale(left) ? 0 : 1) - (TrustRules.showsAsStale(right) ? 0 : 1));
    claims.sort((left, right) =>
      (attentionOrder[left.status] ?? 2) - (attentionOrder[right.status] ?? 2));

    const verifiers = fs.existsSync(paths.verifiersFile)
      ? JSON.parse(fs.readFileSync(paths.verifiersFile, 'utf-8'))
      : {};

    const counts: Record<string, number> = {};
    for (const claim of claims) {
      const shownStatus = TrustRules.showsAsStale(claim) ? Status.Stale : claim.status;
      counts[shownStatus] = (counts[shownStatus] ?? 0) + 1;
    }

    const descriptions = SpaceDirectory.spaceDescriptions();
    const spaces = [...new Set([
      ...claims.map((claim) => claim.space).filter(Boolean),
      ...Object.keys(descriptions),
    ])].sort();

    return { claims, verifiers, counts, spaces, space_desc: descriptions,
             total: claims.length, sys: DashboardData.sysStatus() };
  }

  /** Live store facts for the status bar: the most recent event and today's
   * event count. Ordered by `ts` when present (date-only `at` for old events). */
  private static sysStatus(): Record<string, any> {
    const events = Object.values(EventLog.loadEvents()).flat();
    const today = todayISO();

    let latestEvent: Ev | null = null;
    for (const event of events) {
      const timestamp = DashboardData.eventTimestamp(event);
      if (DashboardData.isMoreRecent(timestamp, latestEvent)) {
        latestEvent = event;
      }
    }

    return {
      last_event: latestEvent
        ? Object.fromEntries(['type', 'effect', 'by', 'at', 'ts', 'claim_id']
            .map((field) => [field, latestEvent![field] ?? null]))
        : null,
      events_today: events.filter((event) =>
        DashboardData.eventTimestamp(event).startsWith(today)).length,
    };
  }

  /** An event's sort key: its full `ts`, else its date-only `at`, else ''. */
  private static eventTimestamp(event: Ev): string {
    return String(event.ts ?? event.at ?? '');
  }

  /** True when `timestamp` beats the best event found so far (or there is none). */
  private static isMoreRecent(timestamp: string, best: Ev | null): boolean {
    return !best || timestamp > DashboardData.eventTimestamp(best);
  }
}
