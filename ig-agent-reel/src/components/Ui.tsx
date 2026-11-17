import React, { CSSProperties, ReactNode } from 'react';
import { C } from '../timeline';
import { clamp, easeOut, seg, typed, typeEnd } from '../anim';

export const FONT = "Pretendard, 'Noto Color Emoji', sans-serif";
export const TITLE_FONT = "'Black Han Sans', 'Noto Color Emoji', sans-serif";

// ✳ 별 모양 (글꼴에 의존하지 않도록 직접 그림)
export const Spark = ({ size = 40, color = C.orange, rotate = 0, style }: { size?: number; color?: string; rotate?: number; style?: CSSProperties }) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100" style={{ display: 'block', transform: `rotate(${rotate}deg)`, flexShrink: 0, ...style }}>
    {[0, 45, 90, 135].map(a => (
      <rect key={a} x={-8} y={-46} width={16} height={92} rx={8} fill={color} transform={`rotate(${a})`} />
    ))}
  </svg>
);

// Claude 데스크톱 앱 느낌의 창: 왼쪽 얇은 아이콘 사이드바 + 흰 본문
export const AppWindow = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <div style={{
    position: 'absolute', left: 40, top: 32, width: 1000, height: 780, background: '#fff',
    borderRadius: 24, boxShadow: '0 12px 40px rgba(27,27,27,.10), 0 2px 6px rgba(27,27,27,.05)',
    overflow: 'hidden', display: 'flex', fontFamily: FONT, color: C.text, ...style,
  }}>
    <div style={{ width: 76, background: '#F5F4F0', borderRight: `1px solid ${C.line}`, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 26, gap: 22 }}>
      <Spark size={30} color="#C9C5BC" />
      {[0, 1, 2, 3].map(i => <div key={i} style={{ width: 30, height: 30, borderRadius: 9, border: '3px solid #D3D0C8' }} />)}
      <div style={{ flex: 1 }} />
      <div style={{ width: 36, height: 36, borderRadius: 18, background: '#E2DFD8', marginBottom: 24 }} />
    </div>
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>{children}</div>
  </div>
);

// 입력창: "/명령어"가 한 글자씩 타이핑됨
export const PromptInput = ({ text, t, t0, cps = 26, placeholder, style }: { text: string; t: number; t0: number; cps?: number; placeholder?: string; style?: CSSProperties }) => {
  const s = typed(text, t, t0, cps);
  const done = t >= typeEnd(text, t0, cps);
  const caret = !done || Math.floor(t * 2.5) % 2 === 0;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', height: 76, padding: '0 26px', borderRadius: 20,
      border: `2px solid ${C.line}`, background: '#fff', boxShadow: '0 4px 14px rgba(0,0,0,.05)',
      fontSize: 32, fontWeight: 500, ...style,
    }}>
      {s ? <span style={{ whiteSpace: 'pre' }}>{renderCmd(s)}</span> : placeholder ? <span style={{ color: '#B1ADA4' }}>{placeholder}</span> : null}
      <span style={{ width: 3, height: 38, background: C.text, marginLeft: 3, opacity: caret ? 1 : 0 }} />
      <div style={{ flex: 1 }} />
      <div style={{ width: 48, height: 48, borderRadius: 14, background: done && s ? C.orange : '#E6E3DC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="22" height="22" viewBox="0 0 24 24"><path d="M12 20V5M5 11l7-7 7 7" stroke="#fff" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
    </div>
  );
};
// 슬래시 명령어 부분은 주황색으로
const renderCmd = (s: string) => {
  if (!s.startsWith('/')) return s;
  const i = s.indexOf(' ');
  const cmd = i < 0 ? s : s.slice(0, i), rest = i < 0 ? '' : s.slice(i);
  return <><span style={{ color: C.orange, fontWeight: 700 }}>{cmd}</span>{rest}</>;
};

// "Loaded ○○ skill" 회색 작은 줄
export const Loaded = ({ name, style }: { name: string; style?: CSSProperties }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 24, color: C.grey, ...style }}>
    <svg width="22" height="22" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" stroke={C.grey} strokeWidth="2.2" fill="none" /><path d="M8 12l3 3 5-6" stroke={C.grey} strokeWidth="2.2" fill="none" strokeLinecap="round" /></svg>
    Loaded {name} skill
  </div>
);

// 주황 ✳ 로딩 아이콘 (돌면서 숨쉼)
export const Thinking = ({ t, label, style }: { t: number; label?: string; style?: CSSProperties }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 26, color: C.grey, ...style }}>
    <Spark size={34} rotate={t * 240} style={{ transform: `rotate(${t * 240}deg) scale(${0.85 + 0.15 * Math.sin(t * 9)})` }} />
    {label}
  </div>
);

// 마우스 커서
export const Cursor = ({ x, y, press = 0 }: { x: number; y: number; press?: number }) => (
  <svg width="44" height="52" viewBox="0 0 22 26" style={{ position: 'absolute', left: x, top: y, transform: `scale(${1 - 0.15 * press})`, transformOrigin: '0 0', filter: 'drop-shadow(0 3px 4px rgba(0,0,0,.25))', zIndex: 10 }}>
    <path d="M2 2 L2 21 L7 16.5 L10.5 24 L13.5 22.6 L10 15.2 L17 15.2 Z" fill="#1B1B1B" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);

// 사진 자리: 그라데이션 + 이모지
export const Photo = ({ emoji, from, to, size = 120, style }: { emoji: string; from: string; to: string; size?: number; style?: CSSProperties }) => (
  <div style={{ background: `linear-gradient(140deg, ${from}, ${to})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size, lineHeight: 1, ...style }}>{emoji}</div>
);

// 원형 프로필
export const Avatar = ({ size = 80, emoji = '☕', from = '#FFB36B', to = '#FF7A1A', ring = false }: { size?: number; emoji?: string; from?: string; to?: string; ring?: boolean }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: `linear-gradient(140deg, ${from}, ${to})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.5, flexShrink: 0, boxShadow: ring ? `0 0 0 4px #fff, 0 0 0 7px ${C.orange}` : undefined }}>{emoji}</div>
);

// 장면 배경 + 내용
export const Stage = ({ bg, children }: { bg: string; children: ReactNode }) => (
  <div style={{ position: 'absolute', inset: 0, background: bg, overflow: 'hidden', fontFamily: FONT, color: C.text }}>{children}</div>
);

// 자막: 하단 중앙(바닥에서 40px), Pretendard Bold 44px, 흰 글씨, 딥그린 둥근 박스
export const CaptionBox = ({ text, t, t0 }: { text: string; t: number; t0: number }) => {
  const e = easeOut(seg(t, t0, t0 + 0.12));
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 40, display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 50 }}>
      <div style={{
        fontFamily: FONT, fontWeight: 700, fontSize: 44, lineHeight: 1.25, color: '#fff', background: C.green,
        padding: '10px 20px', borderRadius: 16, boxShadow: '0 0 0 2px rgba(255,255,255,.14), 0 6px 18px rgba(0,0,0,.18)',
        opacity: clamp(0.3 + e), transform: `translateY(${(1 - e) * 8}px)`, whiteSpace: 'nowrap',
      }}>{text}</div>
    </div>
  );
};
