/** The agent-facing reads: recall, search, pending checks, vocabulary.
 * Trust filtering happens here and nowhere else. */

import { Bm25Ranker } from './bm25-ranker.js';
import { ClaimViews } from './claim-views.js';
import { TrustRules } from '../claims/trust-rules.js';
import { SpaceDirectory } from '../spaces/space-directory.js';
import { ClaimRepository } from '../claims/claim-repository.js';
import { Claim, DISPROVEN, Status, TRUSTED, isOneOf } from '../types.js';

/** Statuses that still need a verifier's attention. */
const UNVERIFIED_STATUSES: readonly Status[] = [Status.Proposed, Status.Supported, Status.Stale];

/** The agent-facing reads: only earned trust ever leaves this class. */
export class RecallService {
  /** Return only TRUSTED, in-scope, non-expired memories, plus warnings about
   * disproven approaches. This is what an agent should act on. */
  static recall(query: string | null = null,
                scope: Record<string, string> | null = null,
                space: string | null = null): Record<string, any> {
    const activeFilters: Record<string, string> = {};
    for (const [key, value] of Object.entries(scope ?? {})) {
      if (value) activeFilters[key] = value;
    }

    // space and tags are hard trust boundaries; the query only ranks survivors
    let candidates = ClaimRepository.allClaims().filter((claim) =>
      RecallService.matchesSpace(claim, space) && RecallService.matchesScope(claim, activeFilters));
    if (query) candidates = Bm25Ranker.rank(query, candidates); // zero-overlap claims drop

    const trusted = candidates.filter((claim) => RecallService.isActionable(claim));
    const warnings = candidates.filter((claim) => RecallService.isWarning(claim));
    const withheldCount = candidates.length - trusted.length - warnings.length;

    return {
      trusted: trusted.map(ClaimViews.trustedView),
      warnings: warnings.map(ClaimViews.warningView),
      withheld_count: withheldCount,
      note: `${trusted.length} trusted mem(s) returned; ${withheldCount} unverified ` +
        `or stale withheld; ${warnings.length} warning(s) (disproven or disputed). ` +
        `Only act on the trusted list.`,
    };
  }

  /** Search every memory regardless of trust; each result shows its status. */
  static searchClaims(query: string): Array<Record<string, any>> {
    const claims = ClaimRepository.allClaims();
    const hits = query ? Bm25Ranker.rank(query, claims) : claims;

    return hits.map((claim) => ({
      id: claim.id,
      claim: claim.claim,
      status: TrustRules.effStatus(claim),
      confidence: claim.confidence,
      scope: claim.scope,
    }));
  }

  /** Claims that carry a machine-checkable assertion and still need verifying. */
  static pendingChecks(): Array<Record<string, any>> {
    const pending: Array<Record<string, any>> = [];

    for (const claim of ClaimRepository.allClaims()) {
      const needsVerifying = isOneOf(UNVERIFIED_STATUSES, TrustRules.effStatus(claim));
      if (!claim.check || !needsVerifying) continue;

      let parsedCheck: Record<string, any> = {};
      try {
        parsedCheck = typeof claim.check === 'string' ? JSON.parse(claim.check) : claim.check;
      } catch {
        parsedCheck = {};
      }

      pending.push({ id: claim.id, claim: claim.claim, scope: claim.scope, check: parsedCheck });
    }

    return pending;
  }

  /** The spaces and tag keys/values already in use, so agents reuse existing
   * names instead of inventing inconsistent ones (e.g. `country` vs `market`). */
  static vocabulary(): Record<string, any> {
    const claims = ClaimRepository.allClaims();
    const descriptions = SpaceDirectory.spaceDescriptions();

    const spaceNames = [...new Set([
      ...claims.map((claim) => claim.space).filter(Boolean),
      ...Object.keys(descriptions),
    ])].sort();

    const valuesByTagKey: Record<string, Set<string>> = {};
    for (const claim of claims) {
      for (const [key, value] of Object.entries(claim.scope ?? {})) {
        (valuesByTagKey[key] ??= new Set()).add(value as string);
      }
    }

    return {
      spaces: spaceNames.map((name) => ({ name, description: descriptions[name as string] ?? '' })),
      tags: Object.fromEntries(Object.keys(valuesByTagKey).sort()
        .map((key) => [key, [...valuesByTagKey[key]].sort()])),
    };
  }

  /** Safe to act on: a trusted status that is neither stale nor disputed. */
  private static isActionable(claim: Claim): boolean {
    return isOneOf(TRUSTED, claim.status) && !claim.stale && !claim.disputed;
  }

  /** Worth a warning: a disproven status, or an open dispute. */
  private static isWarning(claim: Claim): boolean {
    return isOneOf(DISPROVEN, claim.status) || Boolean(claim.disputed);
  }

  /** Case-insensitive tag filter: every requested tag must match. */
  private static matchesScope(claim: Claim, scope: Record<string, string>): boolean {
    return Object.entries(scope).every(([key, value]) =>
      !value || String(claim.scope[key] ?? '').toLowerCase() === String(value).toLowerCase());
  }

  /** Strict: a named space matches only claims filed under it. 'all'/empty = any. */
  private static matchesSpace(claim: Claim, space: string | null | undefined): boolean {
    if (!space || space === 'all') return true;
    return String(claim.space ?? '').toLowerCase() === String(space).toLowerCase();
  }
}
