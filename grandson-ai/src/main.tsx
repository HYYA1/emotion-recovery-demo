import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Video } from './Video';
import { DUR } from './tl';

// 렌더러 계약: window.DUR, window.render(t), window.READY
// 자막 끄기: 주소 끝에 ?sub=0  (showCaptions prop)
const showCaptions = new URLSearchParams(location.search).get('sub') !== '0';
const root = createRoot(document.getElementById('root')!);
const w = window as any;
w.DUR = DUR;
w.render = (t: number) => flushSync(() => root.render(<Video t={t} showCaptions={showCaptions} />));

(async () => {
  const sample = '가나다 챗GPT 제미나이 할머니 ☕🪴🔒';
  await Promise.all([
    ...['400', '500', '600', '700', '800'].map(wt => document.fonts.load(`${wt} 40px Pretendard`, sample)),
    document.fonts.load(`40px "Noto Color Emoji"`, '☕🥐🍰'),
  ]);
  w.render(0);
  await new Promise(r => requestAnimationFrame(() => r(null)));
  w.READY = true;
})();
