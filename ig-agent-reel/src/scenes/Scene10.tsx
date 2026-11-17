import React from 'react';
import { C, SCENES } from '../timeline';
import { Stage, TITLE_FONT } from '../components/Ui';
import { back, pop, seg } from '../anim';

const q = SCENES[9].cue;

export const Scene10 = ({ t }: { t: number }) => {
  const p = seg(t, q.big, q.big + 0.3);
  return (
    <Stage bg={C.green}>
      <div style={{ ...pop(t, q.small), position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', fontSize: 50, fontWeight: 600, color: '#fff' }}>가장 미친 기능</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', fontFamily: TITLE_FONT, fontSize: 330, lineHeight: 1.1, color: C.orange, opacity: Math.min(1, p * 3), transform: `scale(${1.6 - 0.6 * back(p, 2.2)})` }}>바이럴</div>
    </Stage>
  );
};
