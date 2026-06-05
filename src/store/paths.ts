/** Where everything lives on disk — the package root and the memory home. */

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));

/** The installed package root (repo root in dev, package dir when installed). */
export const ROOT = path.resolve(HERE, "..", "..");

/** Where memory lives. Precedence: MEMOTRUST_HOME > a repo checkout's own
 * memory/ (dev, local-first) > ~/.memotrust (installed via npm/npx). */
export function resolveHome(): string {
  if (process.env.MEMOTRUST_HOME) return path.resolve(process.env.MEMOTRUST_HOME);
  if (fs.existsSync(path.join(ROOT, "memory"))) return ROOT;
  return path.join(os.homedir(), ".memotrust");
}

/** The resolved memory home for this process. */
export const HOME = resolveHome();

/** Every file the store touches, derived from HOME and ROOT. */
export const paths = {
  claimsDir: path.join(HOME, "memory", "claims"),
  eventsFile: path.join(HOME, "memory", "events.jsonl"),
  spacesFile: path.join(HOME, "memory", "spaces.json"),
  verifiersFile: path.join(ROOT, "verifiers", "config.json"),
};

/** Test hook: point the store at a temp memory dir. */
export function setPaths(p: Partial<typeof paths>): void {
  Object.assign(paths, p);
}
