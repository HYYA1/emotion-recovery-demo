import React from 'react';
import { C, H, SCENES, W, at, eio, lineAt, sceneOf, seg } from './tl';
import { Character, Pose } from './components/Character';
import { Caption, FONT } from './components/Ui';
import { S01, S02, S03, S04, S05, S06 } from './scenes/Scenes';

const COMPS = [S01, S02, S03, S04, S05, S06];
const SWAP = .35;

const poseAt = (t: number): Pose => {
  const inL = (a: string, b: string) => t >= at(a) - .2 && t < at(b, 'end') + .2;
  if (inL('s01_01', 's01_01')) return 'think';
  if (inL('s01_02', 's01_02') || inL('s04_02', 's04_02')) return 'cheer';
  if (inL('s06_02', 's06_02')) return 'wave';
  const sc = SCENES[sceneOf(t)].id;
  if (sc >= 2 && sc <= 5) return 'point';
  return 'idle';
};

export const Video = ({ t, showCaptions }: { t: number; showCaptions: boolean }) => {
  const i = sceneOf(t), S = SCENES[i], lt = t - S.start;
  const swapping = i > 0 && lt < SWAP, e = eio(seg(lt, 0, SWAP));
  const Cur = COMPS[i], Prev = i > 0 ? COMPS[i - 1] : null;
  const line = lineAt(t);
  return (
    <div style={{ position: 'relative', width: W, height: H, overflow: 'hidden', background: C.bg, fontFamily: FONT, color: C.text }}>
      <div style={{ position: 'absolute', left: -260, top: 320, width: 900, height: 900, borderRadius: '50%', background: '#FFEBD3' }} />
      <div style={{ position: 'absolute', right: -300, bottom: 200, width: 800, height: 800, borderRadius: '50%', background: '#FDEFE0' }} />
      {/* 고정 제목 (쇼츠 위쪽 안전 영역 아래) */}
      <div style={{ position: 'absolute', left: 50, right: 50, top: 220, textAlign: 'center' }}>
        <div style={{ display: 'inline-block', fontSize: 30, fontWeight: 800, color: C.orangeDark, background: '#FFE9D4', borderRadius: 999, padding: '8px 24px' }}>옆집 손주 AI 꿀팁</div>
        <div style={{ fontSize: 76, fontWeight: 900, letterSpacing: -2, marginTop: 10 }}>약 봉투, <span style={{ color: C.orange }}>AI가 읽어 줘요</span> 💊</div>
      </div>
      {swapping && Prev && <div style={{ position: 'absolute', inset: 0, opacity: 1 - e, transform: `translateX(${-e * 80}px)` }}><Prev t={SCENES[i - 1].end - .001} /></div>}
      <div style={{ position: 'absolute', inset: 0, opacity: swapping ? e : 1, transform: swapping ? `translateX(${(1 - e) * 110}px)` : undefined }}><Cur t={t} /></div>
      <Character t={t} pose={poseAt(t)} x={-20} y={1450} scale={.6} />
      {showCaptions && line && <Caption text={line.text} />}
    </div>
  );
};
