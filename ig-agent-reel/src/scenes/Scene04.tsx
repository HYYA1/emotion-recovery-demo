import React from 'react';
import { C, SCENES } from '../timeline';
import { AppWindow, Stage } from '../components/Ui';
import { back, easeOut, pop, seg } from '../anim';

const q = SCENES[3].cue;

const SKILLS: [string, string][] = [
  ['ig-post', '21가지 후킹 공식으로 글쓰기'],
  ['ig-comment', '다른 계정에 댓글'],
  ['ig-reply', '내 댓글에 답장'],
  ['ig-profile', '프로필 최적화'],
  ['ig-plan', '주간 계획'],
  ['ig-viral', '바이럴 릴스 찾기'],
  ['ig-reel', '릴스 대본'],
  ['ig-carousel', '캐러셀 제작'],
  ['ig-story', '스토리 계획'],
  ['ig-hashtag', '해시태그 추천'],
  ['ig-stats', '성과 분석'],
];

export const Scene04 = ({ t }: { t: number }) => {
  const free = back(seg(t, q.free, q.free + 0.3), 2.5);
  return (
    <Stage bg={C.cream}>
      <AppWindow style={pop(t, q.window, 0.25)}>
        <div style={{ display: 'flex', height: '100%' }}>
          <div style={{ width: 210, borderRight: `1px solid ${C.line}`, padding: '34px 22px' }}>
            <div style={{ fontSize: 22, color: C.grey, fontWeight: 600, marginBottom: 18 }}>설정</div>
            {['일반', 'Skills', '커넥터'].map(s => (
              <div key={s} style={{ fontSize: 28, fontWeight: s === 'Skills' ? 700 : 500, padding: '12px 16px', borderRadius: 12, background: s === 'Skills' ? '#F1EFEA' : undefined, color: s === 'Skills' ? C.text : '#77736B', marginBottom: 4 }}>{s}</div>
            ))}
          </div>
          <div style={{ flex: 1, padding: '30px 34px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 36, fontWeight: 800 }}>instagram-agent</div>
              <div style={{ fontSize: 26, fontWeight: 700, background: '#F1EFEA', borderRadius: 12, padding: '2px 12px', color: '#5E5A52' }}>11</div>
              <div style={{ opacity: Math.min(1, free * 2), transform: `scale(${free})`, fontSize: 28, fontWeight: 800, color: '#fff', background: C.orange, borderRadius: 999, padding: '4px 20px', boxShadow: '0 4px 14px rgba(255,122,26,.4)' }}>무료</div>
            </div>
            {SKILLS.map(([name, desc], i) => {
              const r0 = q.rows + i * q.rowGap, d0 = q.desc + i * q.descGap;
              const de = easeOut(seg(t, d0, d0 + 0.25));
              return (
                <div key={name} style={{ ...pop(t, r0, 0.25), display: 'flex', alignItems: 'center', height: 55, borderBottom: i < SKILLS.length - 1 ? `1px solid ${C.line}` : undefined }}>
                  <div style={{ width: 14, height: 14, borderRadius: 4, background: i % 2 ? C.mint : C.orange, marginRight: 16 }} />
                  <div style={{ width: 210, fontSize: 28, fontWeight: 600 }}>{name}</div>
                  <div style={{ fontSize: 25, color: C.grey, opacity: de, transform: `translateX(${(1 - de) * 16}px)` }}>{desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </AppWindow>
    </Stage>
  );
};
