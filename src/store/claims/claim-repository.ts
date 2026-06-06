/** Finds and loads claims from disk — the read-side gateway to memory/. */

import * as fs from 'node:fs';
import * as path from 'node:path';

import { Claim } from '../types.js';
import { paths } from '../paths.js';
import { EventLog } from './event-log.js';
import { TrustRules } from './trust-rules.js';
import { ClaimParser } from './claim-parser.js';

/** Finds and loads claim files from disk (read-only). */
export class ClaimRepository {
  /** Every claim file, sorted by filename (which sorts by id). */
  static claimFiles(): string[] {
    if (!fs.existsSync(paths.claimsDir)) return [];

    return fs.readdirSync(paths.claimsDir)
      .filter((filename) => filename.endsWith('.md'))
      .sort()
      .map((filename) => path.join(paths.claimsDir, filename));
  }

  /** The file behind a claim id, or null when it doesn't exist. */
  static findClaimFile(claimId: string): string | null {
    return ClaimRepository.claimFiles()
      .find((file) => ClaimParser.parseClaim(file).id === claimId) ?? null;
  }

  /** All claims with their evidence trails attached, in chronological order. */
  static allClaims(): Claim[] {
    const eventsByClaim = EventLog.loadEvents();

    return ClaimRepository.claimFiles().map((file) => {
      const claim = ClaimParser.parseClaim(file);

      claim.evidence = (eventsByClaim[claim.id] ?? [])
        .slice()
        .sort((a, b) => String(a.at ?? '').localeCompare(String(b.at ?? '')));
      claim.disputed = TrustRules.isDisputed(claim);

      return claim;
    });
  }
}
