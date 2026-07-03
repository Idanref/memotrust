# memotrust brand assets

Generated with codex CLI → gpt-image-2. Direction: a **verifier / investigator**
(magnifying-glass scrutiny) in a premium **3D app-icon** style — 2026 modern SaaS,
indigo/violet + emerald "verified" accent, smooth and polished.

## Contents

- `memotrust-icon.png` — the chosen app icon (currently the L01 investigator concept; swap to any winner from `logo/`).
- `logo/` — logo concepts (`logo-01…` = investigator mascot, `…-03` = negative-space lens+check mark, `…-05` = monochrome detective, `…-07` = m-monogram, `…-15` = wordmark lockup, etc.). Fifteen directions to choose from.
- `demo/` — poisoning-defense assets:
  - `poisoning-explainer.html` — a self-contained animated explainer (real motion; open in a browser).
  - `demo-01…08.png` — story frames (hero → propose → quarantine → verify → refuted → verified stream → contrast → vault).
  - `poisoning-demo.gif` — the frames stitched into the README hero animation.
- `manifests/` — the prompt sets (`logos.json`, `demo.json`).
- `gen.py` — the generator. Reads a manifest, drives `codex exec` (gpt-image-2), stages PNGs.

## Regenerate / extend

```bash
# add or edit prompts in a manifest (status: "pending"), then:
python3 assets/gen.py assets/manifests/logos.json assets/manifests/demo.json --effort medium
```

Each pending prompt is generated once and marked `done`; re-runs skip finished ones.
Set a prompt back to `"pending"` (or `--retry-failed`) to redo it.

## Stitch the demo GIF (from the frames)

```bash
ffmpeg -y -framerate 1 -pattern_type glob -i 'assets/demo/demo-*.png' \
  -vf "scale=760:-1:flags=lanczos,framerate=fps=24" assets/demo/poisoning-demo.gif
```
