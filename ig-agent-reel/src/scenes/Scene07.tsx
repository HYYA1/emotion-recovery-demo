import React from 'react';
import { C, SCENES } from '../timeline';
import { Avatar, FONT, Photo, Stage } from '../components/Ui';
import { easeOut, pop, seg, typed } from '../anim';

const q = SCENES[6].cue;
const OLD = ['커피 팝니다', '망원동'];
const NEW = ['매일 아침 직접 로스팅 ☕', '망원동', '오전 8시 오픈'];

export const Scene07 = ({ t }: { t: number }) => {
  const mark = easeOut(seg(t, q.mark, q.mark + 0.3));
  const rewriting = t >= q.rewrite;
  const n = Math.max(0, Math.floor((t - q.rewrite) * 30));
  let left = n;
  const lines = NEW.map(s => { const k = Math.min(Array.from(s).length, left); left -= k; return Array.from(s).slice(0, k).join(''); });
  return (
    <Stage bg={C.cream}>
      <div style={{ ...pop(t, q.card, 0.2), position: 'absolute', left: 190, top: 32, width: 700, height: 780, background: '#fff', borderRadius: 28, boxShadow: '0 12px 40px rgba(27,27,27,.10)', fontFamily: FONT, padding: '34px 40px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          <Avatar size={140} emoji="☕" from="#FFC38A" to="#FF7A1A" ring />
          <div style={{ display: 'flex', gap: 34, textAlign: 'center' }}>
            {[['128', '게시물'], ['3,402', '팔로워'], ['210', '팔로잉']].map(([a, b]) => (
              <div key={b}><div style={{ fontSize: 34, fontWeight: 800 }}>{a}</div><div style={{ fontSize: 23, color: C.grey }}>{b}</div></div>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 38, fontWeight: 800, marginTop: 24 }}>모닝빈 커피</div>
        <div style={{ fontSize: 24, color: C.grey, marginTop: 2 }}>@morningbean.cafe</div>
        <div style={{ position: 'relative', marginTop: 14, padding: '10px 14px', marginLeft: -14, borderRadius: 12, minHeight: 130 }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${mark * 100}%`, background: 'rgba(126,214,178,.35)', borderRadius: 12 }} />
          <div style={{ position: 'relative', fontSize: 29, lineHeight: 1.45 }}>
            {(rewriting ? lines : OLD).map((s, i) => <div key={i}>{s || ' '}</div>)}
          </div>
          {rewriting && <div style={{ position: 'absolute', right: 10, top: 8, fontSize: 20, fontWeight: 700, color: '#2E9C72', background: '#E4F7EF', borderRadius: 999, padding: '4px 12px' }}>수정됨</div>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 22 }}>
          {[['☕', '#F3D3A8', '#9C6B45'], ['🥐', '#FCE3B0', '#D9963F'], ['🍰', '#FFE0E6', '#F2A7B5']].map(([e, a, b], i) => (
            <Photo key={i} emoji={e} from={a} to={b} size={84} style={{ ...pop(t, q.grid + i * 0.08, 0.2), height: 200, borderRadius: 10 }} />
          ))}
        </div>
      </div>
    </Stage>
  );
};
