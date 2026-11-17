// Downloads the film's fonts (all SIL OFL) from Google Fonts into fonts/ and writes fonts.css.
// Korean faces are subset to the Hangul used in scene.js. Run from this folder: node fetch_fonts.mjs
import fs from 'fs';
const get = async (u, o) => { const r = await fetch(u, o); if (!r.ok) throw new Error(`${u}: HTTP ${r.status}`); return r; };
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const src = fs.readFileSync('scene.js', 'utf8');
const ko = [...new Set([...src].filter(c => c.charCodeAt(0) >= 0xac00 && c.charCodeAt(0) <= 0xd7a3))].join('');
const chars = encodeURIComponent(ko + ' 0123456789:·');
const fams = [
  `family=Gowun+Batang:wght@400;700&text=${chars}`,
  `family=Nanum+Pen+Script&text=${chars}`,
  `family=IBM+Plex+Mono:wght@400`,
];
let out = '', n = 0; fs.mkdirSync('fonts', { recursive: true });
for (const f of fams) {
  let css = await (await get(`https://fonts.googleapis.com/css2?${f}&display=block`, { headers: { 'User-Agent': UA } })).text();
  for (const u of [...new Set(css.match(/https:\/\/[^)]+/g) || [])]) {
    const name = `f${n++}.woff2`;
    fs.writeFileSync('fonts/' + name, Buffer.from(await (await get(u)).arrayBuffer()));
    css = css.split(u).join('fonts/' + name);
  }
  out += css;
}
fs.writeFileSync('fonts.css', out);
console.log('font files', n, 'hangul', ko.length);
