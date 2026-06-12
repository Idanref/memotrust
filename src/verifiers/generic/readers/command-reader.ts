/** Runs a local command for a `{"kind": "command"}` check — opt-in only.
 *
 * SECURITY: command checks execute locally, so a poisoned claim could smuggle
 * code into a human's "verify" click. This reader therefore refuses to run
 * unless the operator sets MEMOTRUST_ALLOW_COMMAND_CHECKS=1 — memory poisoning
 * must never escalate to code execution by default. */

import { execFileSync } from 'node:child_process';

import { ICheckReader } from '../types.js';

/** The env var (and its opt-in value) that unlocks command checks. Read live,
 * never snapshotted, so an operator/tests can toggle it per run. */
const ALLOW_COMMAND_CHECKS_ENV = 'MEMOTRUST_ALLOW_COMMAND_CHECKS';
const ENV_ENABLED = '1';
/** A verify-time command that runs longer than this (ms) is killed. */
const COMMAND_TIMEOUT_MS = 15000;
/** Splits a command string into argv tokens (whitespace-separated). */
const COMMAND_ARGV_PATTERN = /\s+/;

/** Run the check's command locally and capture its output. */
export class CommandReader implements ICheckReader {
  describeSource(check: Record<string, any>): string {
    return `\`${check.run ?? ''}\` (local)`;
  }

  /** The security gate: read at call time so the operator can toggle it. */
  rejectionReason(): string | null {
    if (process.env[ALLOW_COMMAND_CHECKS_ENV] === ENV_ENABLED) return null;

    return 'command checks are disabled by default (a poisoned claim must not become ' +
      `code execution) — set ${ALLOW_COMMAND_CHECKS_ENV}=${ENV_ENABLED} to opt in`;
  }

  read(check: Record<string, any>): Record<string, any> {
    // no shell: the command is split into argv, so pipes/redirects/substitution
    // in a poisoned check are inert strings, not syntax
    const argv = String(check.run ?? '').split(COMMAND_ARGV_PATTERN).filter(Boolean);
    if (!argv.length) throw new Error('empty command');

    const output = execFileSync(argv[0], argv.slice(1),
      { timeout: COMMAND_TIMEOUT_MS, encoding: 'utf-8', shell: false });
    return { text: output };
  }
}
