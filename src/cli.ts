#!/usr/bin/env node
/** memotrust CLI — one command, three jobs.
 *
 *   memotrust install   set up memory, git-init it, register with Claude Code
 *   memotrust serve     run the dashboard        -> http://localhost:8765
 *   memotrust mcp       serve MCP over stdio (what your agent connects to);
 *                       also brings the dashboard up if the port is free
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { execFileSync } from "node:child_process";

import { startMcp } from "./mcp.js";
import { startServer } from "./server.js";
import { HOME, ROOT } from "./store/paths.js";
import { loadDotEnv } from "./utils/dotenv.js";

const VERSION = "0.1.0";
/** Timeout (ms) for the local git calls install() makes. */
const GIT_TIMEOUT_MS = 5000;
/** Timeout (ms) for registering the MCP server via the claude CLI. */
const MCP_REGISTER_TIMEOUT_MS = 15000;

// secrets for connected verifiers, if the operator configured any
loadDotEnv(ROOT);
loadDotEnv(HOME);

/** True when running from a source checkout rather than an installed package. */
function isDevCheckout(): boolean {
  return fs.existsSync(path.join(ROOT, "src")) && !ROOT.includes(`${path.sep}node_modules${path.sep}`);
}

/** Run a git command quietly; false when git fails or isn't installed. */
function git(args: string[], cwd: string): boolean {
  try { execFileSync("git", args, { cwd, timeout: GIT_TIMEOUT_MS, stdio: "pipe" }); return true; }
  catch { return false; }
}

/** One-time setup: create the memory store, git-init it, register the MCP. */
function install(): void {
  // 1. the store: create it and make its history tamper-evident from day one
  fs.mkdirSync(path.join(HOME, "memory", "claims"), { recursive: true });
  const hasRepo = fs.existsSync(path.join(HOME, ".git"));
  const gitReady = hasRepo || git(["init"], HOME);
  console.log(`memory   ${path.join(HOME, "memory")}`);
  console.log(`git      ${gitReady ? (hasRepo ? "already a repository" : "initialized — history is tamper-evident") : "not available (optional)"}`);

  // 2. register the MCP server with Claude Code
  const cmd = isDevCheckout()
    ? ["claude", "mcp", "add", "memotrust", "--", "npx", "tsx", path.join(ROOT, "src", "cli.ts"), "mcp"]
    : ["claude", "mcp", "add", "memotrust", "--", "npx", "-y", "memotrust", "mcp"];
  try {
    execFileSync(cmd[0], cmd.slice(1), { timeout: MCP_REGISTER_TIMEOUT_MS, stdio: "pipe" });
    console.log("mcp      registered with Claude Code as \"memotrust\"");
  } catch {
    console.log("mcp      couldn't run the claude CLI — register manually:");
    console.log(`         ${cmd.join(" ")}`);
  }

  // 3. done
  console.log("\nDone. Your agent now proposes memories into quarantine;");
  console.log("nothing is trusted until you approve it or evidence confirms it.");
  console.log("Dashboard: run `memotrust serve` (or it starts with your agent) -> http://localhost:8765");
}

/** Print usage and where memory lives. */
function help(): void {
  console.log(`memotrust ${VERSION} — verified memory for AI agents
Usage: memotrust <command>

  install   create the memory store (${HOME === ROOT ? "this checkout" : "~/.memotrust"}), git-init it,
            and register the MCP server with Claude Code
  serve     run the dashboard at http://localhost:8765
  mcp       serve MCP over stdio (agents connect here); the dashboard
            rides along when the port is free

Memory location: MEMOTRUST_HOME > a checkout's own memory/ > ~/.memotrust`);
}

/** The commands `memotrust` understands. */
enum Command {
  Install = "install",
  Serve = "serve",
  Mcp = "mcp",
  Version = "version",
  Help = "help",
}

/** Every accepted argument (including flag aliases) mapped to its command. */
const COMMAND_BY_ARG: Record<string, Command> = {
  install: Command.Install,
  serve: Command.Serve,
  mcp: Command.Mcp,
  "--version": Command.Version,
  "-v": Command.Version,
  help: Command.Help,
  "--help": Command.Help,
  "-h": Command.Help,
};

/** What each command runs. */
const RUN: Record<Command, () => void | Promise<void>> = {
  [Command.Install]: install,
  [Command.Serve]: async () => { await startServer(); },
  [Command.Mcp]: startMcp,
  [Command.Version]: () => console.log(VERSION),
  [Command.Help]: help,
};

const arg = process.argv[2];
const command: Command | undefined = arg === undefined ? Command.Help : COMMAND_BY_ARG[arg];

if (command === undefined) {
  help();
  console.error(`\nunknown command: ${arg}`);
  process.exit(1);
} else {
  await RUN[command]();
}
