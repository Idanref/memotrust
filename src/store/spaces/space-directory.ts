/** The spaces directory — operator-written one-liners describing each space,
 * kept in spaces.json. One tiny domain: read it, update it. */

import * as fs from 'node:fs';
import * as path from 'node:path';

import { paths } from '../paths.js';
import { StoreLock } from '../infra/store-lock.js';

/** Reads and updates the one-line space descriptions (spaces.json). */
export class SpaceDirectory {
  /** All space descriptions, keyed by space name. */
  static spaceDescriptions(): Record<string, string> {
    if (!fs.existsSync(paths.spacesFile)) return {};

    try {
      return JSON.parse(fs.readFileSync(paths.spacesFile, 'utf-8'));
    } catch {
      return {};
    }
  }

  /** Set (or clear, with a falsy description) a one-line description for a space. */
  static describeSpace(space: string, description: string): boolean {
    return StoreLock.withLock(() => {
      const spaceName = (space ?? '').trim();
      if (!spaceName) return false;

      const descriptions = SpaceDirectory.spaceDescriptions();
      const newDescription = (description ?? '').trim();

      if (newDescription) descriptions[spaceName] = newDescription;
      else delete descriptions[spaceName];

      fs.mkdirSync(path.dirname(paths.spacesFile), { recursive: true });
      StoreLock.atomicWrite(paths.spacesFile, JSON.stringify(descriptions, null, 2) + '\n');
      return true;
    });
  }
}
