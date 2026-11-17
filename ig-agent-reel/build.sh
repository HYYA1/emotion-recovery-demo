#!/bin/sh
set -e
LIB=${LIB:-/root/lemo-opuscar}
HERE=$(cd "$(dirname "$0")" && pwd)
cd "$HERE" && npx esbuild src/main.tsx --bundle --outfile=dist/bundle.js --jsx=automatic --minify --define:process.env.NODE_ENV='"production"' --log-level=warning
cd "$LIB"
node core/render/video.mjs "$HERE" --size 1080x1920 --fps 30 --workers ${WORKERS:-4} --out "$HERE/out/reel.mp4"
