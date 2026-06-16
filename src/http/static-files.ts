/** Serves the dashboard's static files from web/ — and nothing outside it. */

import * as fs from 'node:fs';
import * as path from 'node:path';

import { ROOT } from '../store/paths.js';
import { RouteResult } from './types.js';

const WEB = path.join(ROOT, 'web');

/** URL paths that render the single-page dashboard. */
const PAGE_PATHS = ['/', '/memory', '/verifiers'];

/** True when a resolved path climbed out of web/ (a path-traversal attempt).
 * The `path.sep` suffix also rejects sibling dirs like `web-secrets/`. */
function escapesWebRoot(filePath: string): boolean {
  return !filePath.startsWith(WEB + path.sep);
}

/** True when the path points at a real, readable file — not a missing path,
 * not a directory. */
function isReadableFile(filePath: string): boolean {
  return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
}

/** Resolves and reads files under web/, refusing anything outside it. */
export class StaticFiles {
  private static readonly TYPES: Record<string, string> = {
    '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
    '.svg': 'image/svg+xml', '.json': 'application/json',
  };

  /** The file behind a URL path, or null (path traversal is refused). */
  static resolve(pathname: string): string | null {
    if (PAGE_PATHS.includes(pathname)) return path.join(WEB, 'index.html');

    const filePath = path.resolve(WEB, '.' + pathname);
    if (escapesWebRoot(filePath)) return null;
    if (!isReadableFile(filePath)) return null;
    return filePath;
  }

  /** Read a resolved file as a route result with its content type. */
  static read(file: string): RouteResult {
    return {
      code: 200,
      body: fs.readFileSync(file),
      contentType: StaticFiles.TYPES[path.extname(file)] ?? 'application/octet-stream',
    };
  }
}
