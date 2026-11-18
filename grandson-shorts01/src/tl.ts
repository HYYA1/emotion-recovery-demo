// 시간표(src/timeline.json, tools/timeline.py 가 음성 길이로 만듦)와 애니메이션 도우미
import TL from './timeline.json';
import type { CSSProperties } from 'react';

export const W = 1080, H = 1920, FPS = TL.fps, DUR = TL.dur;
export const SCENES = TL.scenes;
export const MOUTH: number[] = TL.mouth;
export const C = {
  bg: '#FFF7EC', panel: '#FFFFFF', text: '#222222', sub: '#6B6460', orange: '#F28C38', orangeDark: '#D96E1C',
  green: '#2F9E6E', red: '#E5484D', blue: '#3B6FE0', navy: '#26324A', line: '#EFE6DA', yellow: '#FFE7A8',
};

const LINE: Record<string, { start: number; dur: number; text: string }> = {};
for (const s of SCENES) for (const l of s.lines) LINE[l.id] = l;
/** 문장이 시작하는 시각(초). 'end' 를 주면 끝나는 시각 */
export const at = (id: string, where: 'start' | 'end' | number = 'start') => {
  const l = LINE[id]; if (!l) throw new Error('no line ' + id);
  return where === 'start' ? l.start : where === 'end' ? l.start + l.dur : l.start + l.dur * where;
};
export const sceneOf = (t: number) => { for (let i = SCENES.length - 1; i >= 0; i--) if (t >= SCENES[i].start) return i; return 0; };
export const lineAt = (t: number) => {
  for (const s of SCENES) for (const l of s.lines) if (t >= l.start - .08 && t < l.start + l.dur + .35) return l;
  return null;
};

export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const eo = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const eio = (t: number) => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const back = (t: number, s = 1.7) => { t = clamp(t) - 1; return t * t * ((s + 1) * t + s) + 1; };
/** 등장: 0.9→1 + 투명→선명 */
export const pop = (t: number, t0: number, d = .35): CSSProperties => {
  const e = back(seg(t, t0, t0 + d), 1.4), o = eo(seg(t, t0, t0 + d * .7));
  return { opacity: o, transform: `scale(${.9 + .1 * e})` };
};
export const rise = (t: number, t0: number, d = .45, dy = 30): CSSProperties => {
  const e = eo(seg(t, t0, t0 + d));
  return { opacity: e, transform: `translateY(${(1 - e) * dy}px)` };
};
export const typed = (s: string, t: number, t0: number, cps = 9) => {
  const a = Array.from(s); return a.slice(0, Math.max(0, Math.min(a.length, Math.floor((t - t0) * cps)))).join('');
};
