/** Live system facts the dashboard's status bar shows. */

import { execFileSync } from 'node:child_process';

import { ROOT } from '../store/paths.js';

/** The git status probe is best-effort; abandon it after this (ms). */
const GIT_STATUS_TIMEOUT_MS = 2000;

/** 'clean' if every memory/ change is committed, 'dirty' if not, null when git
 * is unavailable — the status bar hides the segment then. */
export function gitMemoryState(): string | null {
  try {
    const out = execFileSync('git', ['status', '--porcelain', '--', 'memory'],
                             { cwd: ROOT, timeout: GIT_STATUS_TIMEOUT_MS }).toString();
    return out.trim() ? 'dirty' : 'clean';
  } catch { return null; }
}
