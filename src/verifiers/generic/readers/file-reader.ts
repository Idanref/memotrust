/** Reads a local file for a `{"kind": "file"}` check. */

import * as fs from 'node:fs';
import * as path from 'node:path';

import { ICheckReader } from '../types.js';

/** Read a local file: does it exist, and what does it say. */
export class FileReader implements ICheckReader {
  describeSource(): string {
    return 'local filesystem (read-only)';
  }

  read(check: Record<string, any>): Record<string, any> {
    const filePath = path.isAbsolute(check.path)
      ? check.path
      : path.resolve(process.cwd(), check.path ?? '');

    if (!fs.existsSync(filePath)) return { exists: false, text: '' };
    return { exists: true, text: fs.readFileSync(filePath, 'utf-8') };
  }
}
