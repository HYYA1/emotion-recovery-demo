import React from 'react';
import { C, SCENES } from '../timeline';
import { AppWindow, Loaded, Photo, PromptInput, Stage, Thinking } from '../components/Ui';
import { pop } from '../anim';

const q = SCENES[11].cue;
const CMD = '/ig-viral 카페';
const BULLETS: [string, string][] = [
  ['후킹', '"라떼 이렇게 마시면 손해예요"'],
  ['구조', '문제 → 10초 비교 → 해결'],
  ['성공 이유', '바로 따라 할 수 있어서 저장·공유가 많음'],
];

export const Scene12 = ({ t }: { t: number }) => (
  <Stage bg={C.cream}>
    <AppWindow>
      <div style={{ padding: '34px 40px' }}>
        <PromptInput text={CMD} t={t} t0={q.type} cps={30} />
        {t >= q.loaded && <Loaded name="ig-viral" style={{ ...pop(t, q.loaded, 0.15), marginTop: 30 }} />}
        {t >= q.spin && t < q.result && <Thinking t={t} style={{ marginTop: 22 }} />}
        {t >= q.result && (
          <div style={{ marginTop: 24 }}>
            <div style={{ ...pop(t, q.result, 0.2), display: 'flex', alignItems: 'center', gap: 22 }}>
              <Photo emoji="☕" from="#F3D3A8" to="#9C6B45" size={50} style={{ width: 80, height: 110, borderRadius: 12, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.orange }}>#카페 인기 릴스 분석</div>
                <div style={{ fontSize: 42, fontWeight: 800 }}>1위 릴스 · 조회수 180만</div>
              </div>
            </div>
            {BULLETS.map(([k, v], i) => (
              <div key={k} style={{ ...pop(t, q.bullet + i * q.bulletGap, 0.22), display: 'flex', alignItems: 'center', gap: 18, marginTop: 24, padding: '20px 24px', borderRadius: 18, background: '#FAF8F4', border: `1px solid ${C.line}` }}>
                <div style={{ width: 12, height: 12, borderRadius: 6, background: C.orange, flexShrink: 0 }} />
                <div style={{ fontSize: 30, fontWeight: 800, width: 150, flexShrink: 0 }}>{k}</div>
                <div style={{ fontSize: 30, fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppWindow>
  </Stage>
);
