import React from 'react';
import { C, SCENES } from '../timeline';
import { AppWindow, Spark, Stage } from '../components/Ui';
import { pop } from '../anim';

const q = SCENES[15].cue;
const CHIPS: [string, string][] = [['✏️', '글쓰기'], ['🎓', '배우기'], ['</>', '코드'], ['☕', '일상']];

export const Scene16 = ({ t }: { t: number }) => (
  <Stage bg={C.cream}>
    <AppWindow>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: 30 }}>
        <div style={{ ...pop(t, q.mark), display: 'flex', alignItems: 'center', gap: 22 }}>
          <Spark size={70} rotate={t * 20} />
          <div style={{ ...pop(t, q.hello), fontSize: 64, fontWeight: 600, letterSpacing: -1 }}>좋은 저녁이에요</div>
        </div>
        <div style={{ ...pop(t, q.input), marginTop: 46, width: 760, height: 170, borderRadius: 26, border: `2px solid ${C.line}`, boxShadow: '0 6px 22px rgba(0,0,0,.06)', padding: '26px 30px', boxSizing: 'border-box', position: 'relative' }}>
          <div style={{ fontSize: 32, color: '#A9A59C' }}>무엇을 도와드릴까요?</div>
          <div style={{ position: 'absolute', right: 22, bottom: 20, width: 50, height: 50, borderRadius: 14, background: '#F2B48A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24"><path d="M12 20V5M5 11l7-7 7 7" stroke="#fff" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 30 }}>
          {CHIPS.map(([icon, label], i) => (
            <div key={label} style={{ ...pop(t, q.chips + i * q.chipGap), display: 'flex', alignItems: 'center', gap: 10, fontSize: 28, fontWeight: 600, border: `2px solid ${C.line}`, borderRadius: 16, padding: '12px 22px', color: '#4A4740' }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: icon === '</>' ? C.orange : undefined }}>{icon}</span>{label}
            </div>
          ))}
        </div>
      </div>
    </AppWindow>
  </Stage>
);
