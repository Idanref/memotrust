/** The one sanctioned responder — every HTTP response leaves through here. */

import * as http from 'node:http';

/** Send a response: JSON by default, raw for Buffers/strings. */
export function send(res: http.ServerResponse, code: number, body: unknown,
                     ctype = 'application/json'): void {
  const bytes = Buffer.isBuffer(body) ? body
    : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body));
  res.writeHead(code, { 'Content-Type': ctype, 'Content-Length': bytes.length,
                        'Cache-Control': 'no-store' });
  res.end(bytes);
}
