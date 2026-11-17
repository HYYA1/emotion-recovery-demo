import React from 'react';
import { C, SCENES } from '../timeline';
import { AppWindow, Loaded, PromptInput, Stage, Thinking } from '../components/Ui';
import { pop } from '../anim';

const q = SCENES[4].cue;
const CMD = '/ig-post 신메뉴 바닐라빈 라떼';
const LINES = ['아직도 라떼에 시럽 넣으세요?', '바닐라빈은 진짜 씨앗이에요', '한 모금이면 알아요'];

export const Scene05 = ({ t }: { t: number }) => (
  <Stage bg={C.cream}>
    <AppWindow>
      <div style={{ padding: '34px 40px' }}>
        <PromptInput text={CMD} t={t} t0={q.type} cps={40} />
        {t >= q.loaded && <Loaded name="ig-post" style={{ ...pop(t, q.loaded, 0.15), marginTop: 30 }} />}
        {t >= q.spin && t < q.result && <Thinking t={t} style={{ marginTop: 22 }} />}
        {t >= q.result && (
          <div style={{ marginTop: 22 }}>
            <div style={{ ...pop(t, q.result, 0.2), display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ fontSize: 44, fontWeight: 800 }}>포스트 후킹 문구 3개</div>
              <div style={{ flex: 1 }} />
              <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', background: C.text, borderRadius: 999, padding: '8px 18px' }}>후킹 공식 21개</div>
            </div>
            <div style={{ ...pop(t, q.result + 0.1, 0.2), fontSize: 26, color: C.grey, marginTop: 12 }}>공식 7/21: 실수 지적형</div>
            {LINES.map((s, i) => (
              <div key={i} style={{ ...pop(t, q.result + 0.2 + i * q.lineGap, 0.2), display: 'flex', alignItems: 'center', gap: 20, marginTop: 34, padding: '34px 28px', borderRadius: 18, background: '#FAF8F4', border: `1px solid ${C.line}` }}>
                <div style={{ width: 46, height: 46, borderRadius: 23, background: C.orange, color: '#fff', fontWeight: 800, fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</div>
                <div style={{ fontSize: 38, fontWeight: 600 }}>{s}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppWindow>
  </Stage>
);
