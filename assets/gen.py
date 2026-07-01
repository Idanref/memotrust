#!/usr/bin/env python3
"""Generate images from a prompt manifest via Codex CLI (gpt-image-2).

Self-contained (no repo-root coupling). Manifest schema:
  { "output_staging_folder": "<absolute dir>",
    "prompts": [ { "id", "filename", "prompt", "status": "pending" }, ... ] }

For each pending prompt: call `codex exec` (which uses its built-in image
generation tool), detect the new PNG in ~/.codex/generated_images/, copy it to
output_staging_folder/filename, mark status="done". Retries once on a
disconnect. Usage: python gen.py <manifest.json> [more.json ...] [--effort medium]
"""
from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

GENERATED_ROOT = Path.home() / ".codex" / "generated_images"
RETRYABLE = ("stream disconnected", "Conversation interrupted", "error sending request",
             "Transport error", "error decoding response body", "TIMEOUT")


def snapshot() -> set[Path]:
    GENERATED_ROOT.mkdir(parents=True, exist_ok=True)
    return set(GENERATED_ROOT.rglob("*.png"))


def newest_new(before: set[Path]) -> Path | None:
    new = set(GENERATED_ROOT.rglob("*.png")) - before
    return max(new, key=lambda p: p.stat().st_mtime) if new else None


def run_codex(prompt: str, effort: str, timeout: int = 900) -> tuple[str, Path | None]:
    wrapped = (
        "Use your built-in image generation tool to generate exactly one "
        "standalone image. Do not output any analysis or text — just call the "
        "tool once with the prompt below.\n\nPrompt:\n" + prompt +
        "\n\nExactly one standalone image, not a collage, grid, or multi-panel."
    )
    before = snapshot()
    try:
        proc = subprocess.run(
            ["codex", "exec", "--full-auto", "--skip-git-repo-check",
             "--model", "gpt-5.5", "-c", f'model_reasoning_effort="{effort}"', wrapped],
            capture_output=True, text=True, timeout=timeout,
        )
        out = (proc.stdout or "") + "\n" + (proc.stderr or "")
    except subprocess.TimeoutExpired:
        out = "TIMEOUT"
    return out, newest_new(before)


def write_manifest(path: Path, manifest: dict) -> None:
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
    tmp.replace(path)


def process(path: Path, effort: str, retry_failed: bool) -> None:
    print(f"\n=== {path.name} (effort={effort}) ===", flush=True)
    manifest = json.loads(path.read_text())
    staging = Path(manifest["output_staging_folder"]).expanduser()
    staging.mkdir(parents=True, exist_ok=True)

    for obj in manifest["prompts"]:
        status = obj.get("status")
        if status == "failed" and retry_failed:
            obj.pop("last_error", None)
        elif status != "pending":
            print(f"  [skip] {obj['id']} ({status})", flush=True)
            continue

        dest = staging / obj["filename"]
        ok, last = False, ""
        for attempt in (1, 2):
            print(f"  [gen] {obj['id']} attempt {attempt}", flush=True)
            out, img = run_codex(obj["prompt"], effort)
            last = out
            if img is not None:
                shutil.copy(img, dest)
                obj["status"] = "done"
                obj["saved_path"] = str(dest)
                write_manifest(path, manifest)
                print(f"  [ok ] {obj['id']} -> {dest.name}", flush=True)
                ok = True
                break
            if attempt == 1 and any(p in out for p in RETRYABLE):
                print(f"  [retry] {obj['id']} disconnect", flush=True)
                continue
            break
        if not ok:
            obj["status"] = "failed"
            obj["last_error"] = last[-400:].strip()
            write_manifest(path, manifest)
            print(f"  [fail] {obj['id']}", flush=True)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("manifests", nargs="+")
    ap.add_argument("--effort", default="medium",
                    choices=["minimal", "low", "medium", "high", "xhigh"])
    ap.add_argument("--retry-failed", action="store_true")
    args = ap.parse_args()
    for m in args.manifests:
        p = Path(m).resolve()
        if not p.exists():
            print(f"[error] not found: {p}", flush=True)
            continue
        process(p, args.effort, args.retry_failed)
    return 0


if __name__ == "__main__":
    sys.exit(main())
