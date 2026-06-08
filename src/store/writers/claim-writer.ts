/** Claim lifecycle — bringing claims into the store and (rarely) removing them. */

import * as fs from 'node:fs';
import * as path from 'node:path';

import { paths } from '../paths.js';
import { todayISO } from '../../utils/dates.js';
import { EventLog } from '../claims/event-log.js';
import { StoreLock } from '../infra/store-lock.js';
import { ClaimParser } from '../claims/claim-parser.js';
import { ClaimRepository } from '../claims/claim-repository.js';
import { Confidence, Effect, EventType, Status, isReserved } from '../types.js';

/** Conversational prefixes stripped from captured claims ("remember that…"). */
const CAPTURE_PREFIX_PATTERN = /^(remember that|note that|remember)\s+/i;
/** Runs of characters not allowed in a slug (collapsed to one dash). */
const NON_SLUG_CHARS_PATTERN = /[^a-z0-9]+/g;
/** Leading/trailing dashes trimmed off a finished slug. */
const SLUG_EDGE_DASHES_PATTERN = /^-+|-+$/g;
/** Zero-padded width of a claim id (0001, 0002, …). */
const CLAIM_ID_WIDTH = 4;
/** Longest slug taken from claim text for the filename. */
const SLUG_MAX_LENGTH = 40;
/** Slug used when a claim has no sluggable characters. */
const FALLBACK_SLUG = 'claim';

/** Brings claims into the store and permanently removes them. */
export class ClaimWriter {
  /** Create a new 'proposed' claim. Never trusted until verified. */
  static createClaim(text: string, scope: Record<string, string> | null = null,
                     proposedBy = 'you', space: string | null = null): string {
    return StoreLock.withLock(() => {
      const claimText = text.trim().replace(CAPTURE_PREFIX_PATTERN, '').trim();
      const claimId = ClaimWriter.nextClaimId();
      const today = todayISO();

      const frontmatterLines = [
        `id: ${claimId}`,
        `claim: ${claimText}`,
        `status: ${Status.Proposed}`,
        `confidence: ${Confidence.None}`,
      ];
      if (space) frontmatterLines.push(`space: ${space}`);
      for (const [key, value] of Object.entries(scope ?? {})) {
        if (value && !isReserved(key)) frontmatterLines.push(`${key}: ${value}`);
      }
      frontmatterLines.push(`created: ${today}`, `proposed_by: ${proposedBy}`);

      const filename = `${claimId}-${ClaimWriter.slugify(claimText)}.md`;
      fs.mkdirSync(paths.claimsDir, { recursive: true });
      StoreLock.atomicWrite(path.join(paths.claimsDir, filename),
        '---\n' + frontmatterLines.join('\n') + '\n---\n');

      EventLog.appendEvent({
        claim_id: claimId,
        type: EventType.Proposed,
        source: proposedBy,
        detail: 'proposed',
        by: proposedBy,
        at: today,
        effect: Effect.Proposed,
      });

      return claimId;
    });
  }

  /** Permanently delete a claim and its events. Irreversible (but git-backed). */
  static deleteClaim(claimId: string): boolean {
    return StoreLock.withLock(() => {
      const claimFile = ClaimRepository.findClaimFile(claimId);
      if (!claimFile) return false;

      fs.unlinkSync(claimFile);

      if (fs.existsSync(paths.eventsFile)) {
        const survivingLines: string[] = [];

        for (const line of fs.readFileSync(paths.eventsFile, 'utf-8').split('\n')) {
          if (!line.trim()) continue;
          try {
            if (JSON.parse(line).claim_id === claimId) continue;
          } catch { /* keep malformed lines rather than lose history */ }
          survivingLines.push(line);
        }

        StoreLock.atomicWrite(paths.eventsFile,
          survivingLines.length ? survivingLines.join('\n') + '\n' : '');
      }

      return true;
    });
  }

  /** The next zero-padded id after the highest one on disk. */
  private static nextClaimId(): string {
    const numericIds = ClaimRepository.claimFiles()
      .map((file) => parseInt(ClaimParser.parseClaim(file).id, 10))
      .filter((id) => !isNaN(id));

    const nextId = numericIds.length ? Math.max(...numericIds) + 1 : 1;
    return String(nextId).padStart(CLAIM_ID_WIDTH, '0');
  }

  /** A short filesystem-safe slug for the claim filename. */
  private static slugify(text: string): string {
    return text.toLowerCase()
      .replace(NON_SLUG_CHARS_PATTERN, '-')
      .slice(0, SLUG_MAX_LENGTH)
      .replace(SLUG_EDGE_DASHES_PATTERN, '') || FALLBACK_SLUG;
  }
}
