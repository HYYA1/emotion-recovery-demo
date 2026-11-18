import React from 'react';
import { C, at, pop, rise, typed, SCENES } from '../tl';
import { AppIcon, Callout, Panel, Phone, Ring, Stamp } from '../components/Ui';

// [1] 오프닝: 제목 + 두 앱
export const S01 = ({ t }: { t: number }) => (
  <Panel>
    <div style={{ ...rise(t, .2), position: 'absolute', left: 40, top: 70, fontSize: 40, fontWeight: 800, color: C.orangeDark, background: '#FFE9D4', borderRadius: 999, padding: '10px 30px' }}>옆집 손주가 알려주는 AI · 1편</div>
    <div style={{ ...rise(t, .45), position: 'absolute', left: 40, top: 170, fontSize: 118, fontWeight: 900, lineHeight: 1.12, letterSpacing: -3, color: C.text }}>
      챗GPT·제미나이<br /><span style={{ color: C.orange }}>이것만 알면 돼요</span>
    </div>
    <div style={{ position: 'absolute', left: 40, top: 520, display: 'flex', gap: 60 }}>
      {(['chatgpt', 'gemini'] as const).map((k, i) => (
        <div key={k} style={{ ...pop(t, at('s01_04', .35 + i * .25)), display: 'flex', alignItems: 'center', gap: 26 }}>
          <AppIcon kind={k} size={150} />
          <div style={{ fontSize: 58, fontWeight: 800 }}>{k === 'chatgpt' ? '챗GPT' : '제미나이'}</div>
        </div>
      ))}
    </div>
    <div style={{ ...pop(t, at('s01_05')), position: 'absolute', left: 40, top: 720, fontSize: 54, fontWeight: 800, color: C.green }}>어렵지 않아요 👍  천천히 따라 해 보세요</div>
  </Panel>
);

// [2] AI 대화 앱이 뭐예요?
const EX = ['오늘 저녁 반찬 뭐 할까?', '이 영어 단어 무슨 뜻이야?', '손주 생일 축하 문자 써 줘'];
export const S02 = ({ t }: { t: number }) => {
  const t3 = at('s02_03'), d3 = at('s02_03', 'end') - t3;
  return (
    <Panel>
      <div style={{ ...rise(t, at('s02_01', .25)), position: 'absolute', left: 30, top: 40, display: 'flex', alignItems: 'center', gap: 28 }}>
        <div style={{ fontSize: 60, fontWeight: 800, background: '#fff', borderRadius: 30, padding: '24px 34px', boxShadow: '0 12px 30px rgba(60,40,20,.12)' }}>궁금한 걸 물어보면 🙋</div>
      </div>
      <div style={{ ...rise(t, at('s02_01', .6)), position: 'absolute', right: 30, top: 200, fontSize: 60, fontWeight: 800, background: C.orange, color: '#fff', borderRadius: 30, padding: '24px 34px' }}>대답해 주는 똑똑한 비서 🤖</div>
      <div style={{ position: 'absolute', left: 30, top: 330, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {EX.map((s, i) => (
          <div key={s} style={{ ...rise(t, t3 + d3 * (i / 3) + .1), fontSize: 50, fontWeight: 700, background: '#FFF2C9', borderRadius: 24, padding: '18px 30px', alignSelf: 'flex-start' }}>💬 “{s}”</div>
        ))}
      </div>
      <div style={{ ...pop(t, at('s02_05', .35)), position: 'absolute', right: 40, top: 720, fontSize: 56, fontWeight: 900, color: C.green, background: '#E3F5EC', borderRadius: 26, padding: '16px 34px' }}>한국어도 잘 알아들어요 ✅</div>
    </Panel>
  );
};

// [3] 둘이 뭐가 달라요?
export const S03 = ({ t }: { t: number }) => {
  const card = (k: 'chatgpt' | 'gemini', name: string, maker: string, t0: number) => (
    <div style={{ ...pop(t, t0), width: 500, height: 470, background: '#fff', borderRadius: 40, boxShadow: '0 16px 40px rgba(60,40,20,.12)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, position: 'relative' }}>
      <AppIcon kind={k} size={170} />
      <div style={{ fontSize: 72, fontWeight: 900 }}>{name}</div>
      <div style={{ fontSize: 42, fontWeight: 700, color: C.sub }}>만든 곳: <b style={{ color: C.text }}>{maker}</b></div>
    </div>
  );
  return (
    <Panel>
      <div style={{ position: 'absolute', left: 40, top: 60, display: 'flex', gap: 80 }}>
        {card('chatgpt', '챗GPT', '오픈AI', at('s03_01', .05))}
        {card('gemini', '제미나이', '구글', at('s03_01', .55))}
      </div>
      <div style={{ ...pop(t, at('s03_02')), position: 'absolute', left: 0, right: 0, top: 590, textAlign: 'center', fontSize: 56, fontWeight: 800 }}>하는 일은 거의 비슷해요 🤝</div>
      <div style={{ ...pop(t, at('s03_03', .3)), position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', fontSize: 56, fontWeight: 800, color: C.orangeDark }}>편한 거 <u>하나만</u> 쓰셔도 충분!</div>
      <Stamp t={t} t0={at('s03_04', .45)} color={C.green} style={{ left: 380, top: 770, whiteSpace: 'nowrap', fontSize: 56 }}>기본은 무료</Stamp>
    </Panel>
  );
};

// [4] 설치하기: 앱 가게 → 검색 → 만든 곳 확인
const StoreScreen = ({ t }: { t: number }) => {
  const q = typed('ChatGPT', t, at('s04_04', .15), 5);
  const showResult = t >= at('s04_05');
  return (
    <div style={{ padding: '18px 22px' }}>
      <div style={{ fontSize: 34, fontWeight: 800, marginBottom: 14 }}>🛍️ 앱 가게</div>
      <div style={{ height: 66, borderRadius: 33, background: '#F1ECE6', display: 'flex', alignItems: 'center', padding: '0 24px', fontSize: 30, fontWeight: 700, color: q ? C.text : '#A79F96' }}>🔍&nbsp;{q || '앱 검색'}</div>
      {showResult && (
        <>
          <div style={{ ...rise(t, at('s04_05')), display: 'flex', gap: 18, alignItems: 'center', marginTop: 34 }}>
            <AppIcon kind="chatgpt" size={96} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 32, fontWeight: 800 }}>ChatGPT</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: C.sub, marginTop: 4 }}>OpenAI</div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', background: C.green, borderRadius: 18, padding: '10px 18px' }}>설치</div>
          </div>
          {t >= at('s04_08') && (
            <div style={{ ...rise(t, at('s04_08')), display: 'flex', gap: 18, alignItems: 'center', marginTop: 34, position: 'relative' }}>
              <div style={{ width: 96, height: 96, borderRadius: 26, background: '#9CC9B8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>💬</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 32, fontWeight: 800 }}>Chat AI GPT 4u</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: C.sub, marginTop: 4 }}>모르는 회사</div>
              </div>
              <div style={{ position: 'absolute', inset: -8, borderRadius: 20, background: 'rgba(229,72,77,.12)', border: `5px solid ${C.red}` }} />
              <div style={{ position: 'absolute', right: 6, top: 18, fontSize: 70, color: C.red, fontWeight: 900 }}>✕</div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export const S04 = ({ t }: { t: number }) => {
  const sc = SCENES[3];
  return (
    <Panel>
      <Phone x={40} y={0} style={pop(t, sc.start + .3)}>
        {t < at('s04_03', .45) ? (
          <div style={{ padding: 30, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 26 }}>
            {['📞', '💬', '📷', '🖼️', '⏰', '🗓️', '🌤️', '🎵'].map((e, i) => (
              <div key={i} style={{ width: 82, height: 82, borderRadius: 22, background: '#F1ECE6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>{e}</div>
            ))}
            <div style={{ position: 'relative', width: 82, height: 82, borderRadius: 22, background: '#E3F5EC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>🛍️
              <Ring t={t} t0={at('s04_03', .1)} x={0} y={0} w={82} h={82} />
            </div>
          </div>
        ) : <StoreScreen t={t} />}
      </Phone>
      <Ring t={t} t0={at('s04_06', .2)} x={40 + 16 + 22 + 114} y={16 + 46 + 18 + 14 + 66 + 34 + 46} w={110} h={40} until={at('s04_08')} />
      <Callout style={{ ...rise(t, at('s04_03', .2)), left: 560, top: 40, width: 560 }}>
        안드로이드 → <span style={{ color: C.green }}>플레이 스토어</span><br />아이폰 → <span style={{ color: C.blue }}>앱 스토어</span>
      </Callout>
      <Callout style={{ ...rise(t, at('s04_04', .2)), left: 560, top: 290, width: 560, fontSize: 42 }}>
        검색: <span style={{ color: C.orangeDark }}>ChatGPT</span> 또는 <span style={{ color: C.blue }}>Gemini</span>
      </Callout>
      <Callout style={{ ...rise(t, at('s04_06', .2)), left: 560, top: 470, width: 560 }} bg="#FFF2C9">
        만든 곳 확인!<br /><span style={{ fontSize: 40 }}>챗GPT → OpenAI<br />제미나이 → Google</span>
      </Callout>
      <Callout style={{ ...rise(t, at('s04_09', .1)), left: 560, top: 740, width: 560, fontSize: 36 }} color={C.sub}>
        갤럭시엔 제미나이가 이미 있을 수도 있어요
      </Callout>
    </Panel>
  );
};
