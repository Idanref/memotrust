/** Fetches a URL for a `{"kind": "url"}` check. */

import { ICheckReader } from '../types.js';

/** Read-only URL fetch gives up after this (ms) so a slow host can't hang a check. */
const URL_READ_TIMEOUT_MS = 15000;

/** GET a URL and capture its status and body. */
export class UrlReader implements ICheckReader {
  describeSource(check: Record<string, any>): string {
    return `GET ${check.url ?? ''} (read-only)`;
  }

  async read(check: Record<string, any>): Promise<Record<string, any>> {
    const response = await globalThis.fetch(check.url, // GET only — never writes
      { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(URL_READ_TIMEOUT_MS) });
    return { status: response.status, text: await response.text() };
  }
}
