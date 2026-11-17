#!/bin/sh
# 한 번에 빌드: 번들 → 자막 있는 버전(out/top.mp4) → 자막 없는 버전(out/top_nosub.mp4)
set -e
LIB=${LIB:-/root/lemo-opuscar}
HERE=$(cd "$(dirname "$0")" && pwd)
cd "$HERE" && npx esbuild src/main.tsx --bundle --outfile=dist/bundle.js --jsx=automatic --minify --define:process.env.NODE_ENV='"production"' --log-level=warning
cd "$LIB"
node core/render/video.mjs "$HERE" --size 1080x960 --fps 30 --workers ${WORKERS:-4} --out "$HERE/out/top.mp4"
node core/render/video.mjs "$HERE" --size 1080x960 --fps 30 --workers ${WORKERS:-4} --q 'sub=0' --out "$HERE/out/top_nosub.mp4"
echo "done: $HERE/out/top.mp4  $HERE/out/top_nosub.mp4"
