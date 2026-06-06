/** Turns a claim file's text into a Claim — and nothing else.
 *
 * The frontmatter is the claim's current state; every non-reserved key
 * becomes a freeform tag; the body is free-form notes.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

import { TrustRules } from './trust-rules.js';
import { Claim, Confidence, Status, isReserved } from '../types.js';

/** `---\n key: value lines \n---\n free-form notes` */
const FRONTMATTER_PATTERN = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/;

/** Reads a claim file and turns its text into a Claim object. */
export class ClaimParser {
  /** Parse one claim file: frontmatter is the state, the body is notes. */
  static parseClaim(file: string): Claim {
    const raw = fs.readFileSync(file, 'utf-8');
    const { frontmatter, notes } = ClaimParser.splitFrontmatter(raw);

    const claim: Claim = {
      id: frontmatter.id ?? path.basename(file, '.md'),
      claim: frontmatter.claim ?? '',
      status: frontmatter.status ?? Status.Proposed,
      confidence: frontmatter.confidence ?? Confidence.None,
      scope: ClaimParser.extractTags(frontmatter),
      created: frontmatter.created ?? null,
      last_confirmed: frontmatter.last_confirmed ?? null,
      expires: frontmatter.expires ?? null,
      proposed_by: frontmatter.proposed_by ?? null,
      check: frontmatter.check ?? null,
      space: frontmatter.space ?? null,
      notes,
      _path: path.basename(file),
    };

    claim.stale = TrustRules.isStale(claim);
    return claim;
  }

  /** Split raw claim-file text into frontmatter key/values and the notes body.
   * The one owner of the frontmatter grammar — other store code reuses this
   * instead of re-declaring the `---` regex. */
  static splitFrontmatter(raw: string): { frontmatter: Record<string, string>; notes: string } {
    const match = raw.match(FRONTMATTER_PATTERN);
    if (!match) return { frontmatter: {}, notes: '' };

    const [, frontmatterBlock, body] = match;
    const frontmatter: Record<string, string> = {};

    for (const line of frontmatterBlock.split('\n')) {
      const separator = line.indexOf(':');
      if (separator === -1) continue;

      const key = line.slice(0, separator).trim();
      const value = line.slice(separator + 1).trim();
      frontmatter[key] = value;
    }

    return { frontmatter, notes: body.trim() };
  }

  /** Every non-reserved, non-empty frontmatter key is a freeform tag. */
  private static extractTags(frontmatter: Record<string, string>): Record<string, string> {
    const tags: Record<string, string> = {};

    for (const [key, value] of Object.entries(frontmatter)) {
      if (!isReserved(key) && value) tags[key] = value;
    }

    return tags;
  }
}
