#!/bin/sh
# One command: 약 봉투, AI한테 물어보세요 (Mascot Screencast), 60 s, 1080x1920, 30 fps.
# Needs the Lemo-Opuscar library (setup.sh deps voice), ffmpeg 7+ on PATH, network for fonts, voices and samples.
set -e
LIB=${LIB:-/root/lemo-opuscar}
export LIB
HERE=$(cd "$(dirname "$0")" && pwd)
NAME=medicine-ai-shorts
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the library folder"; exit 1; }
PY="$LIB/.venv/bin/python"
[ -f "$HERE/fonts/kr900.woff2" ] || sh "$HERE/fetch_fonts.sh"
cd "$LIB"
# (the score is synthesised; no instrument samples to fetch)
# voice: edge-tts (through this machine's CA bundle), then a Whisper check of every line (any DIFF stops the build)
"$PY" "$HERE/tts/fit.py" "$LIB"                     # Hyunsu Multilingual narration, each line fitted to its slot
HF_HUB_DISABLE_XET=1 "$PY" core/tts/asr_check.py "$HERE/tts/lines.json" "$HERE/voices" --lang ko
node core/render/events.mjs "$HERE" --size 1080x1920
"$PY" "$HERE/mix.py" "$HERE/out/mix.wav"
node core/render/readcheck.mjs "$HERE" --size 1080x1920
node -e 'const e=JSON.parse(require("fs").readFileSync(process.argv[1])).ev.filter(x=>x.type==="cap");require("fs").writeFileSync(process.argv[2],JSON.stringify(e.map(x=>({t0:x.t,t1:x.t1,text:x.text}))))' "$HERE/events.json" "$HERE/out/cues.json"
"$PY" core/render/srt.py "$HERE/out/cues.json" "$HERE/subtitles_ko.srt"
node core/render/video.mjs "$HERE" --fps 30 --workers ${WORKERS:-4} --size 1080x1920 --out "$HERE/out/video.mp4"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/$NAME.mp4" 30 0
ffmpeg -v error -y -ss 34.5 -i "$HERE/$NAME.mp4" -frames:v 1 -q:v 2 "$HERE/poster.jpg"
echo "done: $HERE/$NAME.mp4"
