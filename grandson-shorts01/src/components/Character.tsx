import React from 'react';
import { MOUTH, FPS, clamp } from '../tl';

export type Pose = 'idle' | 'wave' | 'point' | 'think' | 'cheer';

// 옆집 손주: 둥근 얼굴, 짧은 머리, 주황 후드티. 목소리 크기에 맞춰 입이 움직이고 3~4초마다 눈을 깜빡임
export const Character = ({ t, pose = 'idle', x = 90, y = 300, scale = 1 }: { t: number; pose?: Pose; x?: number; y?: number; scale?: number }) => {
  const f = Math.max(0, Math.min(MOUTH.length - 1, Math.round(t * FPS)));
  const m = MOUTH[f] || 0;
  const mouthH = 4 + 30 * m, mouthW = 46 + 10 * m;
  const blinkPh = (t + 1.3) % 3.7, blink = blinkPh < .12 ? 1 - Math.abs(blinkPh - .06) / .06 : 0;
  const bob = Math.sin(t * 2.1) * 4 + m * 3;
  // 오른팔(화면 오른쪽): 각도
  let arm = 18, fore = 25;
  if (pose === 'wave') { arm = -125 + Math.sin(t * 9) * 14; fore = -30 + Math.sin(t * 9 + 1) * 22; }
  if (pose === 'point') { arm = -62 + Math.sin(t * 2) * 3; fore = -8; }
  if (pose === 'cheer') { arm = -150 + Math.sin(t * 6) * 6; fore = -10; }
  if (pose === 'think') { arm = -115; fore = -130; }
  const lift = pose === 'think' ? 4 : 0;
  return (
    <svg width={560 * scale} height={760 * scale} viewBox="0 0 560 760" style={{ position: 'absolute', left: x, top: y, overflow: 'visible' }}>
      <g transform={`translate(0 ${bob})`}>
        {/* 몸(후드티) */}
        <path d="M95 760 C95 610 150 540 280 540 C410 540 465 610 465 760 Z" fill="#F28C38" />
        <path d="M200 548 C220 600 340 600 360 548" fill="none" stroke="#D96E1C" strokeWidth="14" strokeLinecap="round" />
        <path d="M240 585 L232 660 M320 585 L328 660" stroke="#FFF4E6" strokeWidth="7" strokeLinecap="round" />
        <circle cx="232" cy="664" r="7" fill="#FFF4E6" /><circle cx="328" cy="664" r="7" fill="#FFF4E6" />
        <rect x="205" y="680" width="150" height="70" rx="22" fill="#D96E1C" opacity=".55" />
        {/* 왼팔(가만히) */}
        <path d="M128 600 C100 660 96 720 104 760" stroke="#F28C38" strokeWidth="58" fill="none" strokeLinecap="round" />
        {/* 오른팔 */}
        <g transform={`translate(430 600) rotate(${arm})`}>
          <rect x="-29" y="0" width="58" height="120" rx="29" fill="#F28C38" />
          <g transform={`translate(0 110) rotate(${fore})`}>
            <rect x="-26" y="-10" width="52" height="105" rx="26" fill="#F28C38" />
            <circle cx="0" cy="104" r="30" fill="#FFD9B8" />
            {pose === 'point' && <rect x="-7" y="112" width="14" height="40" rx="7" fill="#FFD9B8" />}
          </g>
        </g>
        {/* 목 */}
        <rect x="248" y="490" width="64" height="70" rx="24" fill="#F6C7A1" />
        {/* 머리 */}
        <g transform={`translate(0 ${-lift}) rotate(${Math.sin(t * 1.3) * 2.2} 280 330)`}>
          <circle cx="152" cy="345" r="34" fill="#FFD0AA" /><circle cx="408" cy="345" r="34" fill="#FFD0AA" />
          <ellipse cx="280" cy="330" rx="140" ry="168" fill="#FFD9B8" />
          {/* 머리카락 */}
          <path d="M138 318 C120 190 210 140 290 146 C380 150 452 210 424 320 C410 262 380 236 330 226 C300 252 230 258 180 238 C160 262 146 290 138 318 Z" fill="#3B2A20" />
          <path d="M250 150 C262 120 300 116 318 142" fill="#3B2A20" />
          {/* 눈썹 */}
          <path d="M196 268 Q222 254 248 266" stroke="#3B2A20" strokeWidth="9" fill="none" strokeLinecap="round" />
          <path d="M312 266 Q338 254 364 268" stroke="#3B2A20" strokeWidth="9" fill="none" strokeLinecap="round" />
          {/* 눈 */}
          <ellipse cx="222" cy="312" rx="17" ry={20 * (1 - blink) + 2} fill="#2A2320" />
          <ellipse cx="338" cy="312" rx="17" ry={20 * (1 - blink) + 2} fill="#2A2320" />
          {blink < .5 && <><circle cx="228" cy="304" r="6" fill="#fff" /><circle cx="344" cy="304" r="6" fill="#fff" /></>}
          {/* 볼 */}
          <ellipse cx="186" cy="372" rx="28" ry="16" fill="#FF9F8A" opacity=".55" />
          <ellipse cx="374" cy="372" rx="28" ry="16" fill="#FF9F8A" opacity=".55" />
          {/* 입 */}
          {m < .06 ? (
            <path d="M246 400 Q280 430 314 400" stroke="#8A3B2A" strokeWidth="9" fill="none" strokeLinecap="round" />
          ) : (
            <g>
              <ellipse cx="280" cy={404 + mouthH * .3} rx={mouthW / 2} ry={clamp(mouthH, 4, 40) / 2 + 6} fill="#8A3B2A" />
              <ellipse cx="280" cy={404 + mouthH * .55 + 4} rx={mouthW / 3.4} ry={clamp(mouthH / 4, 2, 9)} fill="#F27C6A" />
            </g>
          )}
        </g>
      </g>
    </svg>
  );
};
