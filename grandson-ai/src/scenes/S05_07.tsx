import React from 'react';
import { C, at, pop, rise, typed, seg, SCENES, eo } from '../tl';
import { AppIcon, Bubble, Callout, InputBar, MicIcon, Panel, Phone, Ring } from '../components/Ui';

// [5] 처음 들어가기: 로그인
export const S05 = ({ t }: { t: number }) => {
  const sc = SCENES[4], done = t >= at('s05_04', .55);
  const btn = (label: string, icon: string, hl = false) => (
    <div style={{ position: 'relative', height: 84, borderRadius: 42, border: `3px solid ${hl ? '#222' : C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, fontSize: 30, fontWeight: 800, marginTop: 20 }}>
      <span style={{ fontSize: 34 }}>{icon}</span>{label}
    </div>
  );
  return (
    <Panel>
      <Phone x={40} y={0} style={pop(t, sc.start + .2)}>
        <div style={{ padding: '60px 34px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <AppIcon kind="chatgpt" size={130} />
          <div style={{ fontSize: 44, fontWeight: 900, marginTop: 30 }}>로그인</div>
          <div style={{ fontSize: 26, color: C.sub, marginTop: 10, marginBottom: 30 }}>계속하려면 계정을 고르세요</div>
          <div style={{ width: '100%', position: 'relative' }}>
            {btn('Google로 계속하기', '🟢', t >= at('s05_03'))}
            <Ring t={t} t0={at('s05_03', .35)} x={0} y={20} w={382} h={84} r={46} until={at('s05_04', .55)} />
            {btn('Apple로 계속하기', '🍎')}
            {btn('이메일로 계속하기', '✉️')}
          </div>
        </div>
        {done && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,.92)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ...pop(t, at('s05_04', .55)) }}>
            <div style={{ width: 170, height: 170, borderRadius: 85, background: C.green, color: '#fff', fontSize: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
            <div style={{ fontSize: 48, fontWeight: 900, marginTop: 26 }}>끝!</div>
          </div>
        )}
      </Phone>
      <Callout style={{ ...rise(t, at('s05_02', .2)), left: 560, top: 120, width: 560 }}>
        로그인이란?<br /><span style={{ color: C.orangeDark }}>내가 누군지 알려 주기</span>
      </Callout>
      <Callout style={{ ...rise(t, at('s05_03', .3)), left: 560, top: 420, width: 560 }} bg="#FFF2C9">
        제일 쉬운 방법<br />“Google로 계속하기”
      </Callout>
    </Panel>
  );
};

// [6] 첫 질문 해 보기
const Q = '무릎이 아플 때 집에서 할 수 있는 가벼운 운동 알려줘';
const A = ['좋아요! 무리하지 않는 운동이에요.', '① 의자에 앉아 한쪽 다리를 천천히 펴기', '② 무릎 밑에 수건을 받치고 꾹 누르기', '③ 평평한 길을 천천히 걷기', '아프면 바로 멈추고, 계속 아프면 병원에 가 보세요.'];
export const S06 = ({ t }: { t: number }) => {
  const sc = SCENES[5];
  const tq = at('s06_04', .05), tSend = at('s06_05', .6), tAns = at('s06_06', .3);
  const q = typed(Q, t, tq, Array.from(Q).length / (at('s06_04', 'end') - tq + .2));
  const sent = t >= tSend;
  return (
    <Panel>
      <Phone x={40} y={0} style={pop(t, sc.start + .2)}>
        <div style={{ padding: '20px 26px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 30, fontWeight: 800 }}><AppIcon kind="chatgpt" size={56} />챗GPT</div>
          {sent && <Bubble me style={rise(t, tSend, .3)}>{Q}</Bubble>}
          {t >= tAns && (
            <Bubble>
              {A.map((s, i) => <div key={i} style={{ ...rise(t, tAns + i * .45, .3, 10), fontSize: 25, fontWeight: i === 0 || i === 4 ? 600 : 700, color: i === 4 ? C.sub : C.text, marginBottom: 8 }}>{s}</div>)}
            </Bubble>
          )}
        </div>
        <InputBar text={sent ? '' : q} caret={!sent && t >= tq} sendOn={!sent && q.length > 0} />
        <Ring t={t} t0={at('s06_02', .25)} x={18} y={860 - 32 - 46 - 26 - 92 + 14} w={418 - 18} h={92} r={50} until={at('s06_03')} />
        <Ring t={t} t0={at('s06_05', .2)} x={450 - 32 - 30 - 60 - 4} y={860 - 32 - 46 - 26 - 92 + 30} w={60} h={60} r={40} until={tSend} />
      </Phone>
      <Callout style={{ ...rise(t, at('s06_02', .3)), left: 560, top: 60, width: 560 }}>맨 아래 칸을 누르고<br />궁금한 걸 쓰기 ✏️</Callout>
      <Callout style={{ ...rise(t, at('s06_05', .2)), left: 560, top: 330, width: 560 }} bg="#FFF2C9">다 쓰면<br />화살표 버튼 ⬆️</Callout>
      <div style={{ position: 'absolute', left: 560, top: 580, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {['“더 쉽게 말해 줘”', '“세 줄로 줄여 줘”'].map((s, i) => (
          <div key={s} style={{ ...pop(t, at('s06_08', i * .5)), fontSize: 46, fontWeight: 800, background: '#E3F5EC', color: C.green, borderRadius: 999, padding: '14px 34px', alignSelf: 'flex-start' }}>{s}</div>
        ))}
      </div>
    </Panel>
  );
};

// [7] 말로 물어보기
export const S07 = ({ t }: { t: number }) => {
  const sc = SCENES[6], tLive = at('s07_02', .75);
  const live = t >= tLive;
  return (
    <Panel>
      <Phone x={40} y={0} style={pop(t, sc.start + .2)}>
        {!live ? (
          <>
            <div style={{ padding: '20px 26px', display: 'flex', alignItems: 'center', gap: 14, fontSize: 30, fontWeight: 800 }}><AppIcon kind="gemini" size={56} />제미나이</div>
            <InputBar />
            <Ring t={t} t0={at('s07_02', .2)} x={418 - 12 - 60 - 10 - 36 - 8} y={860 - 32 - 46 - 26 - 92 + 26} w={46} h={46} r={30} />
          </>
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#1B2140,#3A2F6B)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', ...pop(t, tLive) }}>
            <div style={{ position: 'relative', width: 260, height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {[0, 1, 2].map(i => {
                const ph = ((t - tLive) * .8 + i / 3) % 1;
                return <div key={i} style={{ position: 'absolute', width: 120 + ph * 220, height: 120 + ph * 220, borderRadius: '50%', border: '6px solid #9FB6FF', opacity: 1 - ph }} />;
              })}
              <div style={{ width: 130, height: 130, borderRadius: 65, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MicIcon size={70} color="#3A2F6B" /></div>
            </div>
            <div style={{ fontSize: 38, fontWeight: 800, marginTop: 60 }}>듣고 있어요…</div>
            <div style={{ fontSize: 26, opacity: .8, marginTop: 12 }}>편하게 말씀하세요</div>
          </div>
        )}
      </Phone>
      <Callout style={{ ...rise(t, at('s07_01', .4)), left: 560, top: 60, width: 560 }}>글씨 대신<br /><span style={{ color: C.orangeDark }}>말로 물어봐도 OK 🎤</span></Callout>
      <Callout style={{ ...rise(t, at('s07_03', .3)), left: 560, top: 330, width: 560 }} bg="#FFF2C9">대답도<br />목소리로 해 줘요 🔊</Callout>
      <Callout style={{ ...rise(t, at('s07_04', .4)), left: 560, top: 600, width: 560 }} bg="#E8EDFF" color="#3A2F6B">제미나이에선<br />“제미나이 라이브”</Callout>
    </Panel>
  );
};
