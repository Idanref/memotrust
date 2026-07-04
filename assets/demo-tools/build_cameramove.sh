#!/bin/bash
set -e
cd assets/demo
A=demo-01-hero.png       # one agent proposing
B=demo-06-verified-stream.png  # vault + many agents
OUT=/tmp/demo-anim.mp4

# Continuous pull-back: zoom-out on A, match-dissolve into a continuing zoom-out on B.
# Source upscaled to 2400px for smooth sub-pixel zoom (reduces zoompan jitter).
ffmpeg -y -loop 1 -t 5.0 -i "$A" -loop 1 -t 5.2 -i "$B" -filter_complex "
[0:v]scale=2400:-1,zoompan=z='max(1.001,1.55-0.55*on/150)':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':fps=30:s=1280x720,setpts=PTS-STARTPTS[a];
[1:v]scale=2400:-1,zoompan=z='max(1.001,1.38-0.38*on/156)':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':fps=30:s=1280x720,setpts=PTS-STARTPTS[b];
[a][b]xfade=transition=fade:duration=1.0:offset=4.0,format=yuv420p,
  vignette=PI/5,
  eq=saturation=1.06:contrast=1.03[v]
" -map "[v]" -r 30 -pix_fmt yuv420p -movflags +faststart "$OUT" 2>/tmp/anim-ff.log || { echo FFMPEG_FAIL; tail -25 /tmp/anim-ff.log; exit 1; }

echo "=== built ==="; ls -lh "$OUT"
ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 "$OUT" 2>/dev/null | xargs echo "duration(s):"
