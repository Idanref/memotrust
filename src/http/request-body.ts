/** Reads a request body as JSON — malformed input becomes an empty object. */

import * as http from 'node:http';

/** Collect the body and parse it; never throws on bad JSON. */
export async function readBody(req: http.IncomingMessage): Promise<Record<string, any>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const raw = Buffer.concat(chunks).toString() || '{}';
  try { return JSON.parse(raw); } catch { return {}; }
}
