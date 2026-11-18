#!/bin/sh
# Noto Sans KR (OFL, Google Fonts), three weights, cut to the characters main.js uses.
set -e
cd "$(dirname "$0")"; mkdir -p fonts
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
CHARS=$(node -e 'const s=require("fs").readFileSync("main.js","utf8");const set=new Set([..."0123456789:·.,!?×✓“”※%/ ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-…()"]);for(const ch of s)if(ch.charCodeAt(0)>127)set.add(ch);process.stdout.write(encodeURIComponent([...set].join("")))')
for w in 500 700 900; do
  css=$(curl -sSfL -A "$UA" "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@$w&text=$CHARS")
  url=$(printf '%s' "$css" | grep -o 'https://[^)]*' | head -1)
  curl -sSfL -o "fonts/kr$w.woff2" "$url"
done
