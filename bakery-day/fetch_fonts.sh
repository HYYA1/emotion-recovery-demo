#!/bin/sh
# Self-hosted Google Fonts (OFL), each cut to the characters the film uses.
set -e
cd "$(dirname "$0")"; mkdir -p fonts
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
enc() { node -e 'process.stdout.write(encodeURIComponent(process.argv[1]))' "$1"; }
get() { # family-query file text
  css=$(curl -sSfL -A "$UA" "https://fonts.googleapis.com/css2?family=$1&text=$(enc "$3")")
  url=$(printf '%s' "$css" | grep -o 'https://[^)]*' | head -1)
  curl -sSfL -o "fonts/$2" "$url"
}
get 'Noto+Serif+KR:wght@500' serif.woff2 '우리 동네 빵집의 하루'
get 'Gaegu:wght@700' hand.woff2 '동네 빵집 갓 구운 식빵 버터 크루아상 팥 가득 단팥빵 첫 손님 거의 다 팔렸어요 마지막 한 개 내일 새벽 다섯 시에 또'
get 'IBM+Plex+Mono:wght@500' mono.woff2 '0123456789:·°C '
