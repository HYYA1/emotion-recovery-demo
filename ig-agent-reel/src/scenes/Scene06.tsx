import React from 'react';
import { C, SCENES } from '../timeline';
import { AppWindow, Avatar, Photo, Stage } from '../components/Ui';
import { pop, typed, typeEnd } from '../anim';

const q = SCENES[5].cue;
const COMMENT = '라떼아트 너무 예뻐요 ☕ 우유 온도 몇 도로 하세요?';
const CPS = 32;

const Row = ({ name, text, from, to, emoji }: { name: string; text: string; from: string; to: string; emoji: string }) => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 22 }}>
    <Avatar size={52} emoji={emoji} from={from} to={to} />
    <div style={{ fontSize: 25, lineHeight: 1.4 }}><b style={{ fontWeight: 700 }}>{name}</b> <span>{text}</span></div>
  </div>
);

export const Scene06 = ({ t }: { t: number }) => {
  const typing = typed(COMMENT, t, q.type, CPS);
  const posted = t >= q.post;
  const ready = t >= typeEnd(COMMENT, q.type, CPS);
  return (
    <Stage bg={C.cream}>
      <AppWindow style={pop(t, q.cards, 0.2)}>
        <div style={{ display: 'flex', height: '100%' }}>
          <div style={{ width: 420, padding: 30, borderRight: `1px solid ${C.line}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <Avatar size={56} emoji="🥛" from="#D9E8FF" to="#8FB4F2" />
              <div style={{ fontSize: 27, fontWeight: 700 }}>latte.lab</div>
            </div>
            <Photo emoji="☕" from="#F3D3A8" to="#9C6B45" size={150} style={{ height: 420, borderRadius: 18 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20, fontSize: 30, fontWeight: 700 }}>
              <span style={{ color: '#FF3B5C', fontSize: 34 }}>♥</span> 2,149
            </div>
            <div style={{ fontSize: 24, color: C.grey, marginTop: 6 }}>오늘의 라떼아트 🌿</div>
          </div>
          <div style={{ flex: 1, padding: '34px 30px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 26 }}>댓글</div>
            <Row name="dawn.coffee" text="색감 미쳤다 😍" emoji="🌅" from="#FFE0B5" to="#F7A65A" />
            <Row name="beanhunter" text="원두 어디 거예요?" emoji="🫘" from="#E4D3C2" to="#9B7A5C" />
            {posted && (
              <div style={{ ...pop(t, q.post, 0.25), background: '#FFF4EA', borderRadius: 16, padding: '14px 14px 0', margin: '0 -14px' }}>
                <Row name="morningbean.cafe" text={COMMENT} emoji="☕" from="#FFC38A" to="#FF7A1A" />
              </div>
            )}
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderTop: `1px solid ${C.line}`, paddingTop: 22 }}>
              <Avatar size={52} emoji="☕" from="#FFC38A" to="#FF7A1A" />
              <div style={{ flex: 1, fontSize: 25, lineHeight: 1.35, minHeight: 68, color: posted ? '#B1ADA4' : C.text }}>
                {posted ? '댓글 달기…' : typing || <span style={{ color: '#B1ADA4' }}>댓글 달기…</span>}
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: ready && !posted ? '#0095F6' : '#B8D9F7' }}>게시</div>
            </div>
          </div>
        </div>
      </AppWindow>
    </Stage>
  );
};
