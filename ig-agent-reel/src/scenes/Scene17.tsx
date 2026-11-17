import React from 'react';
import { C, SCENES } from '../timeline';
import { Avatar, Cursor, FONT, Stage } from '../components/Ui';
import { easeInOut, lerp, pop, seg, typed } from '../anim';

const q = SCENES[16].cue;
// 커서 위치(카드 기준 좌표)
// 커서 끝이 버튼 오른쪽 아래 모서리를 누르도록 해서 버튼 글씨를 가리지 않게 함
const BTN1 = { x: 794, y: 172 }, BTN2 = { x: 786, y: 392 };

export const Scene17 = ({ t }: { t: number }) => {
  const m1 = easeInOut(seg(t, q.cursor1, q.click1 - 0.1));
  const m2 = easeInOut(seg(t, q.cursor2, q.click2 - 0.1));
  const cx = t < q.cursor2 ? lerp(820, BTN1.x, m1) : lerp(BTN1.x, BTN2.x, m2);
  const cy = t < q.cursor2 ? lerp(560, BTN1.y, m1) : lerp(BTN1.y, BTN2.y, m2);
  const press = Math.max(1 - Math.abs(t - q.click1) / 0.08, 1 - Math.abs(t - q.click2) / 0.08, 0);
  const following = t >= q.click1;
  const posted = t >= q.click2;
  const typing = typed('노트', t, q.type, 6);
  return (
    <Stage bg={C.cream}>
      <div style={{ ...pop(t, q.card, 0.2), position: 'absolute', left: 110, top: 40, width: 860, height: 770, background: '#fff', borderRadius: 30, boxShadow: '0 12px 40px rgba(27,27,27,.10)', fontFamily: FONT, padding: '36px 46px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, fontSize: 30, fontWeight: 800, color: C.orange }}>
          <span style={{ width: 44, height: 44, borderRadius: 22, background: C.orange, color: '#fff', fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>팔로우
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 22 }}>
          <Avatar size={96} emoji="💼" from="#FFD3A8" to="#FF7A1A" />
          <div style={{ fontSize: 40, fontWeight: 800 }}>@ai_work_fit</div>
          <div style={{ flex: 1 }} />
          <div style={{ width: 190, height: 70, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800, background: following ? '#EFEFEF' : '#0095F6', color: following ? C.text : '#fff', transform: `scale(${1 - 0.06 * (t < q.cursor2 ? press : 0)})` }}>
            {following ? '팔로잉 ✓' : '팔로우'}
          </div>
        </div>
        <div style={{ height: 2, background: C.line, margin: '38px 0 30px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, fontSize: 30, fontWeight: 800, color: C.orange }}>
          <span style={{ width: 44, height: 44, borderRadius: 22, background: C.orange, color: '#fff', fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>댓글
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 22, height: 84, border: `2px solid ${C.line}`, borderRadius: 20, padding: '0 22px' }}>
          <div style={{ flex: 1, fontSize: 36, fontWeight: 600, color: posted ? '#B1ADA4' : C.text }}>{posted ? '댓글 달기…' : typing || <span style={{ color: '#B1ADA4' }}>댓글 달기…</span>}</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: typing.length === 2 && !posted ? '#0095F6' : '#B8D9F7', transform: `scale(${1 - 0.08 * (t >= q.cursor2 ? press : 0)})` }}>게시</div>
        </div>
        {posted && (
          <div style={{ ...pop(t, q.click2, 0.2), display: 'flex', alignItems: 'center', gap: 16, marginTop: 20, fontSize: 30 }}>
            <Avatar size={52} emoji="🙂" from="#DDF4EA" to="#7ED6B2" /><b>나</b> 노트
          </div>
        )}
        {t >= q.guide && (
          <div style={{ ...pop(t, q.guide, 0.25), position: 'absolute', left: 46, right: 46, bottom: 36, height: 96, borderRadius: 22, background: '#FFF1E6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, fontSize: 38, fontWeight: 800, color: '#C9560A' }}>
            ✈️ 세팅 가이드를 보내드릴게요
          </div>
        )}
        {t >= q.cursor1 - 0.1 && <Cursor x={cx} y={cy} press={press} />}
      </div>
    </Stage>
  );
};
