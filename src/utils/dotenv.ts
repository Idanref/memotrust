/** Minimal .env loader — zero dependencies, existing process env always wins.
 *
 * Secrets (the read-only API keys the verifiers use) live only in a gitignored
 * .env — never in code, never in git. This reads that file into process.env
 * without pulling in the `dotenv` package.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

/** Strips one layer of surrounding single or double quotes from a value. */
const SURROUNDING_QUOTES_PATTERN = /^["']|["']$/g;
/** The `KEY=value` separator inside a .env line. */
const KEY_VALUE_SEPARATOR = '=';
/** Line prefix marking a comment to skip. */
const COMMENT_PREFIX = '#';

/** One `KEY=value` pair parsed from a line of a .env file. */
interface EnvEntry {
  key: string;
  value: string;
}

/** Read a gitignored .env (if present) into process.env. A variable already
 * in the environment is never overwritten, so the real environment always
 * wins over the file. */
export function loadDotEnv(dir: string): void {
  const envFile = path.join(dir, '.env');
  if (!fs.existsSync(envFile)) return;

  for (const line of fs.readFileSync(envFile, 'utf-8').split('\n')) {
    const entry = parseEnvLine(line);
    if (entry && !(entry.key in process.env)) {
      process.env[entry.key] = entry.value;
    }
  }
}

/** A blank line or a `#` comment — skipped by the parser. */
function isSkippableLine(line: string): boolean {
  return !line || line.startsWith(COMMENT_PREFIX);
}

/** No usable key: indexOf returned -1 (no `=`) or 0 (the `=` leads the line). */
function hasNoParsableKey(separatorIndex: number): boolean {
  return separatorIndex < 1;
}

/** Parse one `KEY=value` line into an entry, or null for blanks, comments, and
 * malformed lines (no separator, or an empty key). Surrounding quotes on the
 * value are stripped. */
function parseEnvLine(line: string): EnvEntry | null {
  const trimmed = line.trim();
  if (isSkippableLine(trimmed)) return null;

  const separatorIndex = trimmed.indexOf(KEY_VALUE_SEPARATOR);
  if (hasNoParsableKey(separatorIndex)) return null;

  const key = trimmed.slice(0, separatorIndex).trim();
  const value = trimmed.slice(separatorIndex + 1).trim().replace(SURROUNDING_QUOTES_PATTERN, '');
  return { key, value };
}
