import React from 'react';
import { C, SCENES } from '../timeline';
import { AppWindow, Loaded, PromptInput, Stage, Thinking } from '../components/Ui';
import { pop } from '../anim';

const q = SCENES[7].cue;
const CMD = '/ig-plan 이번 주 계획';
const ROWS: [string, string, string, string][] = [
  ['월', '릴스', '라떼 만드는 과정', '8시'],
  ['화', '캐러셀', '이번 달 원두 3종', '12시'],
  ['수', '스토리', '디저트 투표', '9시'],
  ['목', '릴스', '바리스타 하루', '8시'],
  ['금', '스토리', '주말 한정 메뉴', '10시'],
  ['토', '캐러셀', '매장 투어', '11시'],
  ['일', '댓글', 'DM 답장', '–'],
];
const TAG: Record<string, string> = { 릴스: '#FFE6D3', 캐러셀: '#DDF4EA', 스토리: '#EEE9FF', 댓글: '#F1EFEA' };

export const Scene08 = ({ t }: { t: number }) => (
  <Stage bg={C.cream}>
    <AppWindow>
      <div style={{ padding: '28px 36px' }}>
        <PromptInput text={CMD} t={t} t0={q.type} cps={34} style={{ height: 68 }} />
        {t >= q.loaded && <Loaded name="ig-plan" style={{ ...pop(t, q.loaded, 0.15), marginTop: 18 }} />}
        {t >= q.spin && t < q.result && <Thinking t={t} style={{ marginTop: 16 }} />}
        {t >= q.result && (
          <div style={{ marginTop: 30 }}>
            <div style={{ ...pop(t, q.result, 0.2), fontSize: 44, fontWeight: 800, marginBottom: 20 }}>이번 주 인스타그램</div>
            <div style={{ ...pop(t, q.result + 0.1, 0.2), display: 'flex', fontSize: 22, fontWeight: 700, color: C.grey, padding: '0 16px 6px', borderBottom: `2px solid ${C.line}` }}>
              <div style={{ width: 90 }}>요일</div><div style={{ flex: 1 }}>게시물</div><div style={{ width: 90, textAlign: 'right' }}>시간</div>
            </div>
            {ROWS.map(([d, kind, what, time], i) => (
              <div key={d} style={{ ...pop(t, q.rows + i * q.rowGap, 0.22), display: 'flex', alignItems: 'center', height: 110, padding: '0 16px', borderBottom: `1px solid ${C.line}`, fontSize: 32 }}>
                <div style={{ width: 90, fontWeight: 800, color: C.orange }}>{d}</div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: 22, fontWeight: 700, background: TAG[kind], borderRadius: 8, padding: '3px 10px' }}>{kind}</span>
                  <span style={{ fontWeight: 500 }}>{what}</span>
                </div>
                <div style={{ width: 90, textAlign: 'right', fontWeight: 700 }}>{time}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppWindow>
  </Stage>
);
