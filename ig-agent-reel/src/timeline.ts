// 모든 타이밍을 관리하는 곳 (초 단위).
// start/end: 장면의 전체 시간. cue: 장면 안의 세부 타이밍(장면 시작 기준, 초).
export const FPS = 30;
export const W = 1080;
export const H = 960;
export const DUR = 50;

export const C = {
  cream: '#F6F1E7',
  green: '#0F2A23',
  orange: '#FF7A1A',
  mint: '#7ED6B2',
  text: '#1B1B1B',
  grey: '#8A8A85',
  line: '#ECEAE4',
};

export type Bg = 'cream' | 'green';

export interface SceneDef {
  id: number;
  start: number;
  end: number;
  bg: Bg;
  cue: Record<string, number>;
}

export const SCENES: SceneDef[] = [
  { id: 1, start: 0, end: 4, bg: 'cream', cue: { icons: 0.1, tilt: 2.0, cross: 2.1, title: 2.45 } },
  { id: 2, start: 4, end: 6, bg: 'green', cue: { card: 0.05, run: 0.3, toggle: 1.0 } },
  { id: 3, start: 6, end: 8, bg: 'green', cue: { small: 0.05, big: 0.35 } },
  { id: 4, start: 8, end: 14, bg: 'cream', cue: { window: 0.0, rows: 0.25, rowGap: 0.12, free: 2.0, desc: 3.0, descGap: 0.25 } },
  { id: 5, start: 14, end: 16, bg: 'cream', cue: { type: 0.05, loaded: 0.6, spin: 0.7, result: 1.0, lineGap: 0.15 } },
  { id: 6, start: 16, end: 18, bg: 'cream', cue: { cards: 0.0, type: 0.2, post: 1.3 } },
  { id: 7, start: 18, end: 20, bg: 'cream', cue: { card: 0.0, mark: 0.35, rewrite: 0.7, grid: 0.25 } },
  { id: 8, start: 20, end: 24, bg: 'cream', cue: { type: 0.05, loaded: 0.6, spin: 0.7, result: 1.0, rows: 1.3, rowGap: 0.3 } },
  { id: 9, start: 24, end: 28, bg: 'cream', cue: { card0: 0.15, cardGap: 1.15, fill: 0.4 } },
  { id: 10, start: 28, end: 30, bg: 'green', cue: { small: 0.05, big: 0.4 } },
  { id: 11, start: 30, end: 32, bg: 'cream', cue: { tiles: 0.05, tileGap: 0.07, cursor: 0.75, hover: 1.45 } },
  { id: 12, start: 32, end: 36, bg: 'cream', cue: { type: 0.05, loaded: 0.55, spin: 0.65, result: 1.1, bullet: 1.6, bulletGap: 0.6 } },
  { id: 13, start: 36, end: 38, bg: 'green', cue: {} },
  { id: 14, start: 38, end: 40, bg: 'cream', cue: { type: 0.05, enter: 1.0, loaded: 1.1, spin: 1.25 } },
  { id: 15, start: 40, end: 44, bg: 'cream', cue: { cards: 0.1, check0: 1.0, check1: 2.2 } },
  { id: 16, start: 44, end: 46, bg: 'cream', cue: { mark: 0.05, hello: 0.2, input: 0.4, chips: 0.6, chipGap: 0.08 } },
  { id: 17, start: 46, end: 50, bg: 'cream', cue: { card: 0.05, cursor1: 0.4, click1: 1.1, type: 1.5, cursor2: 2.0, click2: 2.55, guide: 3.0 } },
];

// 전환: 배경색이 바뀌는 장면은 빠른 슬라이드, 같으면 컷.
export const SLIDE = 0.22;

export const sceneAt = (t: number) => {
  for (let i = SCENES.length - 1; i >= 0; i--) if (t >= SCENES[i].start) return i;
  return 0;
};
