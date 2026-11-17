#!/bin/sh
# 한 번에 빌드: 번들 → 화면(1080x1920, 30fps) → 음악+내레이션 믹스 → 최종 out/reel.mp4 (자막 포함, −14 LUFS)
# 음성을 새로 만들 때만: voice/.venv/bin/python voice/gen.py  →  python3 voice/sync.py  (자막 시간 자동 맞춤)
set -e
LIB=${LIB:-/root/lemo-opuscar}
HERE=$(cd "$(dirname "$0")" && pwd)
cd "$HERE" && npx esbuild src/main.tsx --bundle --outfile=dist/bundle.js --jsx=automatic --minify --define:process.env.NODE_ENV='"production"' --log-level=warning
cd "$LIB"
"$LIB/.venv/bin/python" core/audio/sampler.py --need "$HERE/mix.py"
node core/render/video.mjs "$HERE" --size 1080x1920 --fps 30 --workers ${WORKERS:-4} --out "$HERE/out/video.mp4"
"$LIB/.venv/bin/python" "$HERE/mix.py"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/out/reel.mp4" 30 0
echo "done: $HERE/out/reel.mp4"
