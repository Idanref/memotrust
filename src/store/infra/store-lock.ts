/** Write serialization + torn-write protection.
 *
 * The web server and the MCP server are separate processes writing the same
 * files; every mutation runs under a cross-process lock, and full-file
 * rewrites go through an atomic temp-file + rename.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

import { paths } from '../paths.js';

/** Serializes all writers across processes and keeps file rewrites atomic. */
export class StoreLock {
  private static depth = 0;

  /** A lock older than this (ms) belongs to a crashed writer and may be stolen;
   * also the ceiling we wait to acquire before giving up. */
  private static readonly LOCK_TTL_MS = 5000;
  /** How long (ms) to block between acquire attempts. */
  private static readonly RETRY_SLEEP_MS = 8;

  /** Run a mutating function under the cross-process write lock (reentrant). */
  static withLock<T>(fn: () => T): T {
    StoreLock.acquire();
    try { return fn(); } finally { StoreLock.release(); }
  }

  /** Write via temp file + rename so a concurrent reader never sees a torn file. */
  static atomicWrite(file: string, text: string): void {
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, text, 'utf-8');
    fs.renameSync(tmp, file);
  }

  /** The on-disk lock directory, next to the event log. */
  private static lockDir(): string {
    return path.join(path.dirname(paths.eventsFile), '.lock.d');
  }

  /** True once a lock is old enough to have been left by a crashed writer (not
   * touched within the TTL), so it's safe to steal. */
  private static lockIsStale(dir: string): boolean {
    return Date.now() - fs.statSync(dir).mtimeMs > StoreLock.LOCK_TTL_MS;
  }

  /** True once the acquire wait budget has run out and we should give up. */
  private static deadlinePassed(deadline: number): boolean {
    return Date.now() > deadline;
  }

  /** Take the cross-process lock, stealing it from crashed writers. */
  private static acquire(): void {
    if (StoreLock.depth++ > 0) return; // reentrant within this (single-threaded) process
    const dir = StoreLock.lockDir();
    fs.mkdirSync(path.dirname(dir), { recursive: true });
    const deadline = Date.now() + StoreLock.LOCK_TTL_MS;
    for (;;) {
      try {
        fs.mkdirSync(dir); // atomic across processes
        return;
      } catch {
        try { // steal locks older than the TTL — a crashed writer, not a live one
          if (StoreLock.lockIsStale(dir)) { fs.rmdirSync(dir); continue; }
        } catch { /* raced with the releaser — retry */ }
        if (StoreLock.deadlinePassed(deadline)) throw new Error('memotrust: write lock timeout');
        StoreLock.sleepSync(StoreLock.RETRY_SLEEP_MS);
      }
    }
  }

  /** Give the lock back once the outermost writer finishes. */
  private static release(): void {
    if (--StoreLock.depth > 0) return;
    try { fs.rmdirSync(StoreLock.lockDir()); } catch { /* already gone */ }
  }

  /** Block briefly between lock attempts. */
  private static sleepSync(ms: number): void {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
  }
}
