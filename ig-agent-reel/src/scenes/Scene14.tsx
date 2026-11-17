import React from 'react';
import { C, SCENES } from '../timeline';
import { AppWindow, Loaded, PromptInput, Stage, Thinking } from '../components/Ui';
import { pop } from '../anim';

const q = SCENES[13].cue;
const CMD = '/ig-viral 이번 주 영상 아이디어 3개';

export const Scene14 = ({ t }: { t: number }) => (
  <Stage bg={C.cream}>
    <AppWindow>
      <div style={{ padding: '34px 40px' }}>
        <PromptInput text={CMD} t={t} t0={q.type} cps={26} />
        {t >= q.loaded && <Loaded name="ig-viral" style={{ ...pop(t, q.loaded, 0.15), marginTop: 30 }} />}
        {t >= q.spin && <Thinking t={t} label="아이디어를 찾는 중…" style={{ ...pop(t, q.spin, 0.2), marginTop: 24, fontSize: 30 }} />}
      </div>
    </AppWindow>
  </Stage>
);
