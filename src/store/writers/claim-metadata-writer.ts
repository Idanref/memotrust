/** Filing metadata on an existing claim: its space and its freeform tags.
 * Organizational only — never touches status or evidence. */

import * as fs from 'node:fs';

import { isReserved } from '../types.js';
import { StoreLock } from '../infra/store-lock.js';
import { ClaimParser } from '../claims/claim-parser.js';
import { ClaimRepository } from '../claims/claim-repository.js';

/** Matches the existing `space:` line (present-check + value replace). */
const SPACE_LINE_PATTERN = /^space:.*$/m;
/** Matches the `space:` line including its newline, for removal. */
const SPACE_LINE_WITH_NEWLINE_PATTERN = /^space:.*\n?/m;
/** The `confidence:` line, after which a new `space:` line is inserted. */
const CONFIDENCE_LINE_PATTERN = /^(confidence:.*)$/m;

/** True when a parsed claim file has neither frontmatter fields nor notes —
 * there's nothing to keep, so a tag rewrite is refused. */
function isEmptyClaimFile(frontmatter: Record<string, string>, notes: string): boolean {
  return !Object.keys(frontmatter).length && !notes;
}

/** Updates how a claim is filed — its space and its freeform tags. */
export class ClaimMetadataWriter {
  /** File a claim under a space (or clear it with a falsy space). */
  static setSpace(claimId: string, space: string | null): boolean {
    return StoreLock.withLock(() => {
      const claimFile = ClaimRepository.findClaimFile(claimId);
      if (!claimFile) return false;

      let contents = fs.readFileSync(claimFile, 'utf-8');
      const requestedSpace = (space ?? '').trim();
      const hasSpaceLine = SPACE_LINE_PATTERN.test(contents);

      if (hasSpaceLine) {
        contents = requestedSpace
          ? contents.replace(SPACE_LINE_PATTERN, `space: ${requestedSpace}`)
          : contents.replace(SPACE_LINE_WITH_NEWLINE_PATTERN, '');
      } else if (requestedSpace) {
        contents = contents.replace(CONFIDENCE_LINE_PATTERN, `$1\nspace: ${requestedSpace}`);
      }

      StoreLock.atomicWrite(claimFile, contents);
      return true;
    });
  }

  /** Replace a claim's freeform tags (scope). Reserved fields are untouched. */
  static setTags(claimId: string, tags: Record<string, string>): boolean {
    return StoreLock.withLock(() => {
      const claimFile = ClaimRepository.findClaimFile(claimId);
      if (!claimFile) return false;

      // reuse the parser rather than re-declaring the frontmatter grammar
      const { frontmatter, notes } = ClaimParser.splitFrontmatter(fs.readFileSync(claimFile, 'utf-8'));
      if (isEmptyClaimFile(frontmatter, notes)) return false;

      const keptLines: string[] = [];
      for (const [key, value] of Object.entries(frontmatter)) {
        if (isReserved(key)) keptLines.push(`${key}: ${value}`);
      }

      for (const [rawKey, rawValue] of Object.entries(tags ?? {})) {
        const key = String(rawKey).trim();
        const value = String(rawValue).trim();
        if (key && value && !isReserved(key)) keptLines.push(`${key}: ${value}`);
      }

      StoreLock.atomicWrite(claimFile, '---\n' + keptLines.join('\n') + '\n---\n' + notes);
      return true;
    });
  }
}
