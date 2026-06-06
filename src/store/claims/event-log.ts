/** The append-only evidence log. Corrections are new events, never edits. */

import * as fs from 'node:fs';
import * as path from 'node:path';

import { Ev } from '../types.js';
import { paths } from '../paths.js';
import { nowISO } from '../../utils/dates.js';
import { StoreLock } from '../infra/store-lock.js';

/** Reads and appends the append-only evidence trail (events.jsonl). */
export class EventLog {
  /** The whole log, grouped by claim id. Malformed lines are skipped. */
  static loadEvents(): Record<string, Ev[]> {
    const eventsByClaim: Record<string, Ev[]> = {};
    if (!fs.existsSync(paths.eventsFile)) return eventsByClaim;

    for (const line of fs.readFileSync(paths.eventsFile, 'utf-8').split('\n')) {
      if (!line.trim()) continue;

      let event: Ev;
      try {
        event = JSON.parse(line);
      } catch {
        continue;
      }

      (eventsByClaim[event.claim_id ?? ''] ??= []).push(event);
    }

    return eventsByClaim;
  }

  /** Append one event. Every event gets a timestamp when it doesn't carry one. */
  static appendEvent(event: Ev): void {
    StoreLock.withLock(() => {
      event.ts ??= nowISO();

      fs.mkdirSync(path.dirname(paths.eventsFile), { recursive: true });
      fs.appendFileSync(paths.eventsFile, JSON.stringify(event) + '\n', 'utf-8');
    });
  }
}
