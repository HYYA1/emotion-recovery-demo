import type { CSSProperties } from 'react';

export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const easeInOut = (t: number) => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const back = (t: number, s = 1.7) => { t = clamp(t) - 1; return t * t * ((s + 1) * t + s) + 1; };

// 등장: scale 0.9→1 + fade
export const pop = (t: number, t0: number, d = 0.3): CSSProperties => {
  const e = easeOut(seg(t, t0, t0 + d));
  return { opacity: e, transform: `scale(${0.9 + 0.1 * e})` };
};
export const shown = (t: number, t0: number) => t >= t0;

// 한 글자씩 타이핑 (한글도 글자 단위)
export const typed = (text: string, t: number, t0: number, cps = 26) => {
  const chars = Array.from(text);
  const n = Math.floor(Math.max(0, t - t0) * cps);
  return chars.slice(0, Math.min(chars.length, n)).join('');
};
export const typeEnd = (text: string, t0: number, cps = 26) => t0 + Array.from(text).length / cps;
