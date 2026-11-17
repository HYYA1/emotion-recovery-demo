import React from 'react';
import { C, SCENES } from '../timeline';
import { AppWindow, Cursor, Photo, Stage } from '../components/Ui';
import { easeInOut, lerp, pop, seg } from '../anim';

const q = SCENES[10].cue;
export const REELS: [string, string, string, string, string][] = [
  ['×12', '라떼 이렇게 마시면 손해', '☕', '#F3D3A8', '#9C6B45'],
  ['×8', '1분 만에 라떼아트', '🎨', '#FCE3B0', '#D9963F'],
  ['×5', '사장님만 아는 원두 비밀', '🫘', '#E4D3C2', '#7B5A3E'],
  ['×4', '홈카페 3분 레시피', '🥛', '#DCEBFA', '#8FB4F2'],
  ['×3', '크루아상 굽는 아침', '🥐', '#FFE9C2', '#E3A04B'],
  ['×2', '케이크 진열 꿀팁', '🍰', '#FFE0E6', '#F2A7B5'],
];

export const Scene11 = ({ t }: { t: number }) => {
  const m = easeInOut(seg(t, q.cursor, q.hover));
  const cx = lerp(820, 215, m), cy = lerp(1150, 330, m);
  const hover = t >= q.hover;
  return (
    <Stage bg={C.cream}>
      <AppWindow>
        <div style={{ padding: '26px 30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, height: 64, borderRadius: 18, background: '#F5F4F0', padding: '0 22px', fontSize: 30, fontWeight: 600 }}>
            <svg width="28" height="28" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="7" stroke="#77736B" strokeWidth="2.6" fill="none" /><path d="M16 16l5 5" stroke="#77736B" strokeWidth="2.6" strokeLinecap="round" /></svg>
            카페
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 22, color: C.grey, fontWeight: 500 }}>인기 릴스</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 20 }}>
            {REELS.map(([badge, title, e, a, b], i) => (
              <div key={i} style={{ ...pop(t, q.tiles + i * q.tileGap, 0.22), position: 'relative', height: 560, borderRadius: 18, overflow: 'hidden', boxShadow: i === 0 && hover ? `0 0 0 5px ${C.orange}` : 'none' }}>
                <Photo emoji={e} from={a} to={b} size={130} style={{ position: 'absolute', inset: 0, paddingBottom: 50 }} />
                <div style={{ position: 'absolute', left: 12, top: 12, fontSize: 22, fontWeight: 800, color: '#fff', background: i === 0 ? C.orange : 'rgba(27,27,27,.75)', borderRadius: 999, padding: '4px 12px' }}>▶ {badge}</div>
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '30px 14px 14px', background: 'linear-gradient(transparent, rgba(0,0,0,.65))', color: '#fff', fontSize: 26, fontWeight: 700, lineHeight: 1.3 }}>{title}</div>
              </div>
            ))}
          </div>
        </div>
        {t >= q.cursor - 0.1 && <Cursor x={cx} y={cy} />}
      </AppWindow>
    </Stage>
  );
};
