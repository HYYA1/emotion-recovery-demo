import React from 'react';
import { C, H, SCENES, W, at, eio, lineAt, sceneOf, seg } from './tl';
import { Character, Pose } from './components/Character';
import { Caption, FONT } from './components/Ui';
import { S01, S02, S03, S04 } from './scenes/S01_04';
import { S05, S06, S07 } from './scenes/S05_07';
import { S08, S09, S10 } from './scenes/S08_10';

const COMPS = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10];
const SWAP = .45;   // 장면이 넘어가는 시간

// 손주 동작: 문장 구간별
const poseAt = (t: number): Pose => {
  const inL = (a: string, b: string) => t >= at(a) - .2 && t < at(b, 'end') + .2;
  if (inL('s01_01', 's01_02') || inL('s10_05', 's10_05') || inL('s10_07', 's10_07')) return 'wave';
  if (inL('s03_04', 's03_05') || inL('s10_03', 's10_03')) return 'cheer';
  if (inL('s02_01', 's02_01') || inL('s09_03', 's09_04')) return 'think';
  const sc = SCENES[sceneOf(t)].id;
  if (sc >= 4 && sc <= 8) return 'point';
  return 'idle';
};

export const Video = ({ t, showCaptions }: { t: number; showCaptions: boolean }) => {
  const i = sceneOf(t), S = SCENES[i], lt = t - S.start;
  const swapping = i > 0 && lt < SWAP;
  const e = eio(seg(lt, 0, SWAP));
  const Cur = COMPS[i], Prev = i > 0 ? COMPS[i - 1] : null;
  const line = lineAt(t);
  return (
    <div style={{ position: 'relative', width: W, height: H, overflow: 'hidden', background: C.bg, fontFamily: FONT, color: C.text }}>
      {/* 배경 무늬: 은은한 동그라미 */}
      <div style={{ position: 'absolute', left: -200, top: -260, width: 900, height: 900, borderRadius: '50%', background: '#FFEBD3' }} />
      <div style={{ position: 'absolute', right: -240, bottom: -300, width: 760, height: 760, borderRadius: '50%', background: '#FDEFE0' }} />
      {swapping && Prev && (
        <div style={{ position: 'absolute', inset: 0, opacity: 1 - e, transform: `translateX(${-e * 120}px)` }}><Prev t={SCENES[i - 1].end - .001} /></div>
      )}
      <div style={{ position: 'absolute', inset: 0, opacity: swapping ? e : 1, transform: swapping ? `translateX(${(1 - e) * 160}px)` : undefined }}><Cur t={t} /></div>
      <Character t={t} pose={poseAt(t)} x={70} y={300} />
      {showCaptions && line && <Caption text={line.text} />}
    </div>
  );
};
