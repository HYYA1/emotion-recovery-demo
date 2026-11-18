#!/bin/sh
# 한 번에 빌드: 번들 → 화면(1080x1920 쇼츠, 30fps, 자막 포함) → 음악·효과음·목소리 믹스 → out/grandson-shorts01.mp4 (−14 LUFS)
# 대본을 고쳤을 때만 먼저:
#   python3 tools/make_lines.py                       (대본 → 문장)
#   voice/.venv/bin/python voice/gen.py               (AI 목소리, 남성 M1)
#   <lib>/.venv/bin/python voice/check.py             (받아쓰기 검사, BAD= 가 비어야 함)
#   voice/.venv/bin/python tools/timeline.py          (음성 길이 → 시간표·입 모양·자막)
set -e
LIB=${LIB:-/root/lemo-opuscar}
HERE=$(cd "$(dirname "$0")" && pwd)
cd "$HERE" && npx esbuild src/main.tsx --bundle --outfile=dist/bundle.js --jsx=automatic --minify --define:process.env.NODE_ENV='"production"' --log-level=warning
cd "$LIB"
"$LIB/.venv/bin/python" core/audio/sampler.py --need "$HERE/mix.py"
node core/render/video.mjs "$HERE" --size 1080x1920 --fps 30 --workers ${WORKERS:-4} --out "$HERE/out/video.mp4"
"$LIB/.venv/bin/python" "$HERE/mix.py"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/out/grandson-shorts01.mp4" 30 0
echo "done: $HERE/out/grandson-shorts01.mp4"
