import React from 'react';
import { C, SCENES } from '../timeline';
import { Stage, TITLE_FONT } from '../components/Ui';
import { pop } from '../anim';

const q = SCENES[2].cue;

export const Scene03 = ({ t }: { t: number }) => (
  <Stage bg={C.green}>
    <div style={{ ...pop(t, q.small), position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', fontSize: 48, fontWeight: 600, color: '#fff' }}>이름하여</div>
    <div style={{ ...pop(t, q.big, 0.25), position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center', fontFamily: TITLE_FONT, color: C.orange, fontSize: 158, lineHeight: 1.08 }}>
      INSTAGRAM<br />AGENT
    </div>
  </Stage>
);
