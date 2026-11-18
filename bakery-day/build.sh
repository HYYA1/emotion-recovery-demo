#!/bin/sh
# One command: 우리 동네 빵집의 하루 (Watercolor Brush), 30 s, 1920x1080, 60 fps.
#   sh build.sh       fonts, paper, events, sound mix, picture, master, poster
# Needs the Lemo-Opuscar library with its core packages (setup.sh deps), ffmpeg 7+ on PATH,
# and network once for the fonts and the instrument samples (freepats, vcsl).
set -e
LIB=${LIB:-/root/lemo-opuscar}
export LIB
HERE=$(cd "$(dirname "$0")" && pwd)
NAME=bakery-day
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the library folder"; exit 1; }
PY="$LIB/.venv/bin/python"
[ -f "$HERE/fonts/hand.woff2" ] || sh "$HERE/fetch_fonts.sh"
[ -f "$HERE/paper.jpg" ] || (cd "$HERE" && "$PY" paper.py)
cd "$LIB"
"$PY" core/audio/sampler.py --need "$HERE/mix.py"
node core/render/events.mjs "$HERE"
"$PY" "$HERE/mix.py" "$HERE/out/mix.wav"
node core/render/video.mjs "$HERE" --fps 60 --workers ${WORKERS:-4} --out "$HERE/out/video.mp4"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/$NAME.mp4" 60 0
ffmpeg -v error -y -ss 16.5 -i "$HERE/$NAME.mp4" -frames:v 1 -q:v 2 "$HERE/poster.jpg"
echo "done: $HERE/$NAME.mp4"
