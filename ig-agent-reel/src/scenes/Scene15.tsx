import React from 'react';
import { C, SCENES } from '../timeline';
import { Stage } from '../components/Ui';
import { back, easeOut, lerp, pop, seg } from '../anim';

const q = SCENES[14].cue;
const CARDS: [string, string, number][] = [
  ['내 말투', 'voice.md', q.check0],
  ['내 타깃', 'audience.md', q.check1],
];

const mixHex = (a: string, b: string, t: number) => {
  const A = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), B = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], t))).join(',')})`;
};

export const Scene15 = ({ t }: { t: number }) => (
  <Stage bg={C.cream}>
    {CARDS.map(([label, file, tc], i) => {
      const c = back(seg(t, tc, tc + 0.3), 2);
      const ink = easeOut(seg(t, tc, tc + 0.3));
      return (
        <div key={file} style={{ ...pop(t, q.cards + i * 0.15), position: 'absolute', left: 110, width: 860, top: 560 + i * 340, height: 280, boxSizing: 'border-box', background: '#fff', borderRadius: 30, boxShadow: '0 10px 30px rgba(27,27,27,.08)', display: 'flex', alignItems: 'center', padding: '0 54px', gap: 40 }}>
          <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: 48, border: '6px solid #D9D5CC', boxSizing: 'border-box', opacity: 1 - ink }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: 48, background: C.mint, transform: `scale(${c})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="56" height="56" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </div>
          <div style={{ fontSize: 64, fontWeight: 800, color: mixHex('#BDB8AE', C.text, ink) }}>{label}</div>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 36, fontWeight: 600, fontFamily: "'IBM Plex Mono', Pretendard, monospace", color: mixHex('#C7C2B8', '#5E5A52', ink), background: '#F5F4F0', borderRadius: 14, padding: '10px 20px' }}>{file}</div>
        </div>
      );
    })}
  </Stage>
);
