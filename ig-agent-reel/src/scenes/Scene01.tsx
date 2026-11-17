import React from 'react';
import { C, SCENES } from '../timeline';
import { Spark, Stage, TITLE_FONT } from '../components/Ui';
import { easeOut, pop, seg, back } from '../anim';

const q = SCENES[0].cue;

// 인스타풍 아이콘(실제 로고 아님): 그라데이션 둥근사각형 + 단순한 카메라 도형
const CamIcon = () => (
  <div style={{ width: 220, height: 220, borderRadius: 60, background: 'linear-gradient(45deg, #FFC85C 0%, #FF7A3D 30%, #E8336E 60%, #A23BD1 85%, #6A5BEA 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 14px 30px rgba(0,0,0,.14)' }}>
    {/* 단순한 카메라 실루엣: 몸체 + 셔터 돌기 + 렌즈 */}
    <svg width="150" height="150" viewBox="0 0 100 100">
      <rect x="30" y="20" width="24" height="14" rx="4" fill="#fff" />
      <rect x="8" y="28" width="84" height="58" rx="12" fill="#fff" />
      <circle cx="50" cy="57" r="19" fill="#E8336E" />
      <circle cx="50" cy="57" r="11" fill="#fff" opacity=".55" />
      <circle cx="78" cy="40" r="4" fill="#FF7A3D" />
    </svg>
  </div>
);

export const Scene01 = ({ t }: { t: number }) => {
  const tilt = easeOut(seg(t, q.tilt, q.tilt + 0.3));
  const x1 = seg(t, q.cross, q.cross + 0.18), x2 = seg(t, q.cross + 0.15, q.cross + 0.33);
  const tp = seg(t, q.title, q.title + 0.25);
  const ts = 1.7 - 0.7 * back(tp, 2.2);
  const shake = t > q.title + 0.2 && t < q.title + 0.5 ? Math.sin((t - q.title) * 90) * 8 * (1 - seg(t, q.title + 0.2, q.title + 0.5)) : 0;
  return (
    <Stage bg={C.cream}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center', gap: 70, transform: `translateX(${shake}px)` }}>
        <div style={pop(t, q.icons)}>
          <div style={{ width: 220, height: 220, borderRadius: 60, background: C.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 14px 30px rgba(255,122,26,.30)' }}>
            <Spark size={130} color="#fff" />
          </div>
        </div>
        <div style={{ ...pop(t, q.icons + 0.15), position: 'relative' }}>
          <div style={{ transform: `rotate(${-14 * tilt}deg) translateY(${tilt * 10}px)`, opacity: 1 - 0.35 * tilt }}><CamIcon /></div>
          <svg width="300" height="300" viewBox="0 0 300 300" style={{ position: 'absolute', left: -40, top: -40, overflow: 'visible' }}>
            <line x1="30" y1="30" x2={30 + 240 * x1} y2={30 + 240 * x1} stroke={C.orange} strokeWidth="26" strokeLinecap="round" opacity={x1 > 0 ? 1 : 0} />
            <line x1="270" y1="30" x2={270 - 240 * x2} y2={30 + 240 * x2} stroke={C.orange} strokeWidth="26" strokeLinecap="round" opacity={x2 > 0 ? 1 : 0} />
          </svg>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 790, textAlign: 'center', fontFamily: TITLE_FONT, fontSize: 330, lineHeight: 1.1, color: C.orange, opacity: tp > 0 ? Math.min(1, tp * 3) : 0, transform: `scale(${ts}) translateX(${shake}px)` }}>
        끝났다
      </div>
    </Stage>
  );
};
