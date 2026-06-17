/** memotrust web server — the composition root of the HTTP layer.
 *
 * Routes live in http/api-routes.ts as data; this file only wires them:
 * router -> static fallback -> not found, with the one error normalizer.
 * The agent-facing half is mcp.ts.
 *
 * Importing this module has no side effects; call startServer(). The CLI
 * (`memotrust serve`) starts it standalone, and the MCP server starts it
 * opportunistically so the dashboard is alive whenever an agent is connected.
 */

import * as http from 'node:http';

import { Router } from './http/router.js';
import { send } from './http/responder.js';
import { AppError } from './errors/index.js';
import { HttpMethod } from './http/types.js';
import { API_ROUTES } from './http/api-routes.js';
import { readBody } from './http/request-body.js';
import { StaticFiles } from './http/static-files.js';

export const DEFAULT_PORT = 8765;

const router = new Router(API_ROUTES);

/** Route one request: API table first, then static files, then 404. */
async function handle(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const method = req.method ?? HttpMethod.Get;

  const matched = router.match(method, url.pathname);
  if (matched) {
    const payload = method === HttpMethod.Post ? await readBody(req) : {};
    const result = await matched.handle({ params: matched.params, payload });
    return send(res, result.code, result.body, result.contentType);
  }

  if (method === HttpMethod.Get) {
    const file = StaticFiles.resolve(url.pathname);
    if (file) {
      const page = StaticFiles.read(file);
      return send(res, page.code, page.body, page.contentType);
    }
  }

  throw AppError.notFound();
}

/** Start the dashboard on 127.0.0.1. Resolves once listening; rejects on
 * error (e.g. EADDRINUSE — another memotrust already serves the same store). */
export function startServer(port = DEFAULT_PORT): Promise<http.Server> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      // the one error normalizer: handlers throw, only this layer answers
      handle(req, res).catch((error) => error instanceof AppError
        ? send(res, error.statusCode, error.toJSON())
        : send(res, 500, { error: String(error?.message ?? error) }));
    });
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => {
      // stderr on purpose: in MCP mode stdout carries the protocol
      console.error(`memotrust dashboard -> http://localhost:${port}`);
      resolve(server);
    });
  });
}
