import React from 'react';
import { C, SCENES } from '../timeline';
import { Stage } from '../components/Ui';
import { easeOut, seg } from '../anim';

const q = SCENES[8].cue;
const CARDS: [string, string][] = [
  ['무엇을', '릴스 · 캐러셀 · 스토리'],
  ['언제', '화 + 목 오전 8시'],
  ['누구에게', '출근길 직장인'],
];

export const Scene09 = ({ t }: { t: number }) => (
  <Stage bg={C.cream}>
    {CARDS.map(([k, v], i) => {
      const t0 = q.card0 + i * q.cardGap;
      const e = easeOut(seg(t, t0, t0 + 0.3));
      const f = easeOut(seg(t, t0 + q.fill, t0 + q.fill + 0.3));
      return (
        <div key={k} style={{
          position: 'absolute', left: 70, width: 940, top: 330 + i * 420, height: 360, boxSizing: 'border-box',
          background: '#fff', borderRadius: 28, boxShadow: '0 10px 30px rgba(27,27,27,.08)', display: 'flex', alignItems: 'center', padding: '0 50px',
          opacity: e, transform: `translateY(${(1 - e) * 40}px) scale(${0.9 + 0.1 * e})`,
        }}>
          <div style={{ width: 330, fontSize: 78, fontWeight: 800, letterSpacing: -1 }}>{k}</div>
          <div style={{ fontSize: 56, color: C.orange, fontWeight: 800, marginRight: 36 }}>→</div>
          <div style={{ fontSize: 50, fontWeight: 600, opacity: f, transform: `translateX(${(1 - f) * 20}px)` }}>{v}</div>
        </div>
      );
    })}
  </Stage>
);
