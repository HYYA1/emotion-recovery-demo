import React, { CSSProperties, ReactNode } from 'react';
import { C, clamp, eo, seg } from '../tl';

export const FONT = "Pretendard, 'Noto Color Emoji', sans-serif";

// 오른쪽 설명 영역 (캐릭터는 왼쪽)
export const Panel = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <div style={{ position: 'absolute', left: 700, top: 50, width: 1160, height: 870, ...style }}>{children}</div>
);

// 휴대폰 목업 (실제 기종 디자인 아님)
export const Phone = ({ children, x = 0, y = 0, style }: { children: ReactNode; x?: number; y?: number; style?: CSSProperties }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: 450, height: 860, borderRadius: 64, background: '#1E1E22', padding: 16, boxSizing: 'border-box', boxShadow: '0 30px 60px rgba(60,40,20,.22)', ...style }}>
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 50, overflow: 'hidden', background: '#fff', fontFamily: FONT, color: C.text }}>
      <div style={{ height: 46, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 34px', fontSize: 22, fontWeight: 700 }}>
        <span>9:41</span><span style={{ width: 110, height: 30, borderRadius: 15, background: '#1E1E22' }} /><span>●●●</span>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 46, bottom: 0 }}>{children}</div>
    </div>
  </div>
);

// 반짝이는 동그라미 강조 표시
export const Ring = ({ t, t0, x, y, w, h, color = C.red, r = 24, until = 1e9 }: { t: number; t0: number; x: number; y: number; w: number; h: number; color?: string; r?: number; until?: number }) => {
  if (t < t0 || t > until) return null;
  const e = eo(seg(t, t0, t0 + .3)), pulse = 1 + .03 * Math.sin((t - t0) * 7);
  return <div style={{ position: 'absolute', left: x - 10, top: y - 10, width: w + 20, height: h + 20, borderRadius: r, border: `7px solid ${color}`, boxSizing: 'border-box', opacity: e, transform: `scale(${(1.25 - .25 * e) * pulse})`, pointerEvents: 'none', zIndex: 20 }} />;
};

// 말풍선 설명(콜아웃)
export const Callout = ({ children, style, color = C.navy, bg = '#fff' }: { children: ReactNode; style?: CSSProperties; color?: string; bg?: string }) => (
  <div style={{ position: 'absolute', background: bg, color, borderRadius: 28, padding: '26px 34px', fontSize: 46, fontWeight: 800, lineHeight: 1.3, boxShadow: '0 14px 34px rgba(60,40,20,.13)', fontFamily: FONT, ...style }}>{children}</div>
);

// 앱 아이콘 (실제 로고가 아닌 단순 도형: 말풍선)
export const AppIcon = ({ kind, size = 120 }: { kind: 'chatgpt' | 'gemini'; size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: size * .26, flexShrink: 0, background: kind === 'chatgpt' ? '#1F9D78' : 'linear-gradient(135deg,#4C7DF0,#9B6CF2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 18px rgba(0,0,0,.12)' }}>
    <svg width={size * .58} height={size * .58} viewBox="0 0 100 100">
      <path d="M14 22 Q14 10 26 10 H74 Q86 10 86 22 V60 Q86 72 74 72 H44 L26 88 V72 Q14 72 14 60 Z" fill="#fff" />
      {kind === 'chatgpt'
        ? <><circle cx="34" cy="41" r="6" fill="#1F9D78" /><circle cx="50" cy="41" r="6" fill="#1F9D78" /><circle cx="66" cy="41" r="6" fill="#1F9D78" /></>
        : <path d="M50 24 L56 38 L70 41 L56 45 L50 58 L44 45 L30 41 L44 38 Z" fill="#6E74F0" />}
    </svg>
  </div>
);

// 전송 화살표 버튼
export const SendBtn = ({ on = true, size = 64 }: { on?: boolean; size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, background: on ? '#222' : '#D8D2CA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    <svg width={size * .45} height={size * .45} viewBox="0 0 24 24"><path d="M12 20V5M5 11l7-7 7 7" stroke="#fff" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </div>
);
export const MicIcon = ({ size = 40, color = '#222' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><rect x="8.5" y="3" width="7" height="12" rx="3.5" fill={color} /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round" /></svg>
);
export const PlusIcon = ({ size = 40, color = '#222' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2.6" strokeLinecap="round" /></svg>
);

// 대화 앱 화면 아래 입력칸
export const InputBar = ({ text = '', placeholder = '물어보세요', caret = false, sendOn = false, style }: { text?: string; placeholder?: string; caret?: boolean; sendOn?: boolean; style?: CSSProperties }) => (
  <div style={{ position: 'absolute', left: 18, right: 18, bottom: 26, minHeight: 92, borderRadius: 46, border: `3px solid ${C.line}`, background: '#fff', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px 10px 18px', boxSizing: 'border-box', ...style }}>
    <PlusIcon size={38} color="#555" />
    <div style={{ flex: 1, fontSize: 27, fontWeight: 600, lineHeight: 1.3, color: text ? C.text : '#A79F96' }}>
      {text || placeholder}{caret && <span style={{ display: 'inline-block', width: 3, height: 30, background: C.text, marginLeft: 2, verticalAlign: 'middle' }} />}
    </div>
    <MicIcon size={36} color="#555" />
    <SendBtn on={sendOn} size={60} />
  </div>
);

// 대화 말풍선
export const Bubble = ({ me = false, children, style }: { me?: boolean; children: ReactNode; style?: CSSProperties }) => (
  <div style={{ alignSelf: me ? 'flex-end' : 'flex-start', maxWidth: '86%', background: me ? '#F1ECE6' : 'transparent', borderRadius: 26, padding: me ? '16px 22px' : '4px 6px', fontSize: 26, fontWeight: me ? 600 : 500, lineHeight: 1.45, ...style }}>{children}</div>
);

// 자막: 쇼츠 안전 영역 안 (아래쪽 쇼츠 버튼·제목에 가리지 않게), 큰 글씨
export const Caption = ({ text }: { text: string }) => (
  <div style={{ position: 'absolute', left: 50, right: 150, top: 1300, display: 'flex', justifyContent: 'center', zIndex: 60, pointerEvents: 'none' }}>
    <div style={{ background: 'rgba(28,30,40,.9)', color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 54, lineHeight: 1.32, padding: '16px 30px', borderRadius: 24, textAlign: 'center', wordBreak: 'keep-all' }}>{text}</div>
  </div>
);

export const Stamp = ({ t, t0, children, color = C.red, style }: { t: number; t0: number; children: ReactNode; color?: string; style?: CSSProperties }) => {
  if (t < t0) return null;
  const p = seg(t, t0, t0 + .25), s = 1.8 - .8 * eo(p);
  return <div style={{ position: 'absolute', border: `8px solid ${color}`, color, borderRadius: 22, padding: '10px 26px', fontSize: 64, fontWeight: 900, fontFamily: FONT, transform: `rotate(-10deg) scale(${s})`, opacity: clamp(p * 3), background: 'rgba(255,255,255,.85)', ...style }}>{children}</div>;
};
