#!/usr/bin/env python3
import subprocess, tempfile, os
DEMO = "assets/demo"
FONT = "/System/Library/Fonts/Supplemental/Arial.ttf"
BG = "#0a0b14"; W, H = 1280, 800
D, F = 2.0, 0.6          # per-frame duration, crossfade
STEP = D - F

frames = ["demo-01-hero.png","demo-02-propose.png","demo-03-quarantine.png","demo-04-verify-scan.png",
          "demo-05-refuted.png","demo-06-verified-stream.png","demo-07-contrast-split.png","demo-08-vault-hero.png"]
caps = ["Agents propose memories (good and bad)",
        "Every new memory starts unverified",
        "A poisoned claim? Quarantined. Never trusted.",
        "Evidence verifies every claim",
        "Disproven memory is refused",
        "recall() serves only what earned trust",
        "So poisoning never spreads",
        "Verified memory your agents can trust"]

work = tempfile.mkdtemp()
# 1) scrim frames (fit+pad, bottom gradient scrim, emerald rule) — NO text baked
for i, f in enumerate(frames):
    out = f"{work}/g{i:02d}.png"
    subprocess.run(["magick", f"{DEMO}/{f}", "-resize", f"{W}x{H}", "-background", BG,
        "-gravity", "center", "-extent", f"{W}x{H}",
        "(", "-size", f"{W}x230", f"gradient:none-#060713f2", ")", "-gravity", "south", "-composite",
        "-gravity", "south", "-fill", "#34d39a", "-draw", "rectangle 585,150 695,153",
        out], check=True, cwd=DEMO)

# 2) image-only crossfade chain
inputs = []
for i in range(8):
    inputs += ["-loop", "1", "-t", str(D), "-i", f"{work}/g{i:02d}.png"]
fc = "[0:v]format=yuv420p[v0];"
last = "[v0]"
for k in range(1, 8):
    off = round(k * STEP, 3)
    fc += f"[{k}:v]format=yuv420p[c{k}];{last}[c{k}]xfade=transition=fade:duration={F}:offset={off}[v{k}];"
    last = f"[v{k}]"

# 3) timed caption overlays (only during each frame's solo hold -> no overlap)
draw = []
for k, cap in enumerate(caps):
    if k == 0:
        s, e = 0.2, STEP - 0.15
    elif k == 7:
        s, e = k * STEP + 0.62, 8 * STEP + 0.5
    else:
        s, e = k * STEP + 0.62, (k + 1) * STEP - 0.15
    txt = cap.replace("'", "’")  # avoid quote escaping
    draw.append(f"drawtext=fontfile='{FONT}':text='{txt}':fontsize=40:fontcolor=0xF2F3FB:"
                f"x=(w-text_w)/2:y=h-92:enable='between(t,{round(s,3)},{round(e,3)})'")
fc += last + ",".join(draw) + "[out]"

mp4 = f"{DEMO}/poisoning-demo.mp4"
subprocess.run(["ffmpeg", "-y", *inputs, "-filter_complex", fc, "-map", "[out]",
                "-r", "30", "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4], check=True)

# 4) GIF (smaller: 700px, 15fps, diff palette)
pal = f"{work}/pal.png"
subprocess.run(["ffmpeg", "-y", "-i", mp4, "-vf",
    "fps=15,scale=700:-1:flags=lanczos,palettegen=stats_mode=diff", pal], check=True,
    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
subprocess.run(["ffmpeg", "-y", "-i", mp4, "-i", pal, "-lavfi",
    "fps=15,scale=700:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3",
    f"{DEMO}/poisoning-demo.gif"], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

subprocess.run(f"rm -rf {work}", shell=True)
print("done"); subprocess.run(["ls", "-lh", mp4, f"{DEMO}/poisoning-demo.gif"])
