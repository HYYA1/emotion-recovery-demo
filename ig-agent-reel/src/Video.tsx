import React from 'react';
import { H, SCENES, SLIDE, W, sceneAt } from './timeline';
import { CAPTIONS } from './captions';
import { CaptionBox } from './components/Ui';
import { easeOut, seg } from './anim';
import { Scene01 } from './scenes/Scene01';
import { Scene02 } from './scenes/Scene02';
import { Scene03 } from './scenes/Scene03';
import { Scene04 } from './scenes/Scene04';
import { Scene05 } from './scenes/Scene05';
import { Scene06 } from './scenes/Scene06';
import { Scene07 } from './scenes/Scene07';
import { Scene08 } from './scenes/Scene08';
import { Scene09 } from './scenes/Scene09';
import { Scene10 } from './scenes/Scene10';
import { Scene11 } from './scenes/Scene11';
import { Scene12 } from './scenes/Scene12';
import { Scene13 } from './scenes/Scene13';
import { Scene14 } from './scenes/Scene14';
import { Scene15 } from './scenes/Scene15';
import { Scene16 } from './scenes/Scene16';
import { Scene17 } from './scenes/Scene17';

const COMPS = [Scene01, Scene02, Scene03, Scene04, Scene05, Scene06, Scene07, Scene08, Scene09, Scene10, Scene11, Scene12, Scene13, Scene14, Scene15, Scene16, Scene17];

const Layer = ({ i, t, x = 0 }: { i: number; t: number; x?: number }) => {
  const S = SCENES[i], Comp = COMPS[i];
  return (
    <div style={{ position: 'absolute', inset: 0, transform: x ? `translateX(${x}px)` : undefined }}>
      <Comp t={Math.min(t - S.start, S.end - S.start - 1e-3)} />
    </div>
  );
};

export const Video = ({ t, showCaptions }: { t: number; showCaptions: boolean }) => {
  const i = sceneAt(t), S = SCENES[i];
  const lt = t - S.start;
  // 배경색이 바뀌는 곳은 빠른 슬라이드, 같은 배경이면 컷
  const sliding = i > 0 && lt < SLIDE && SCENES[i - 1].bg !== S.bg;
  const e = easeOut(seg(lt, 0, SLIDE));
  const cap = CAPTIONS.find(c => t >= c.start && t < c.end);
  return (
    <div style={{ position: 'relative', width: W, height: H, overflow: 'hidden' }}>
      {sliding && <Layer i={i - 1} t={SCENES[i - 1].end - 1e-3} x={-e * W * 0.35} />}
      <Layer i={i} t={t} x={sliding ? (1 - e) * W : 0} />
      {showCaptions && cap && <CaptionBox text={cap.text} t={t} t0={cap.start} />}
    </div>
  );
};
