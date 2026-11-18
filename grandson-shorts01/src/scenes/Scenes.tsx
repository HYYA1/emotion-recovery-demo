import React, { CSSProperties } from 'react';
import { C, SCENES, at, eo, pop, rise, seg, typed, clamp } from '../tl';
import { AppIcon, Bubble, Callout, InputBar, MicIcon, Phone, Ring } from '../components/Ui';

// 가상의 약 봉투 (실제 약 이름·약국 없음). fs = 글씨 크기 배율, cover = 이름 칸 가리기 진행(0~1)
export const MedBag = ({ fs = 1, cover = 0, style }: { fs?: number; cover?: number; style?: CSSProperties }) => {
  const f = (n: number) => n * fs;
  const row = (a: string, b: string) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: f(15), color: '#5d5a56', padding: `${f(3)}px 0`, borderBottom: '1px dashed #d9d2c7' }}><span>{a}</span><span>{b}</span></div>
  );
  return (
    <div style={{ background: '#FBFAF6', borderRadius: f(10), boxShadow: '0 16px 40px rgba(60,40,20,.18)', padding: f(20), boxSizing: 'border-box', position: 'relative', ...style }}>
      <div style={{ textAlign: 'center', fontSize: f(22), fontWeight: 800, color: '#3d6e57', borderBottom: `${f(3)}px solid #3d6e57`, paddingBottom: f(6) }}>○○약국 · 약 봉투</div>
      <div style={{ position: 'relative', fontSize: f(16), marginTop: f(10), color: '#3a3733' }}>
        성명: 김○○ 님 &nbsp; 조제일: 11월 18일
        {cover > 0 && <div style={{ position: 'absolute', left: f(-6), top: f(-4), height: f(30), width: `${cover * 46}%`, background: '#FFD25E', borderRadius: f(8), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: f(15), fontWeight: 800, overflow: 'hidden', whiteSpace: 'nowrap' }}>✋ 가림</div>}
      </div>
      <div style={{ fontSize: f(15), marginTop: f(8), color: '#3a3733', fontWeight: 700 }}>복용법: 1일 2회 · 아침/저녁 식후 30분 · 3일분</div>
      <div style={{ marginTop: f(8) }}>
        {row('해열진통제', '1정')}{row('위장약', '1정')}{row('콧물약', '1정')}
      </div>
      <div style={{ fontSize: f(13), marginTop: f(8), color: '#8a837b' }}>※ 졸음이 올 수 있으니 운전·기계 조작에 주의하십시오. 음주를 피하십시오.<br />※ 이상 반응이 있으면 복용을 중단하고 의사·약사와 상의하십시오.</div>
    </div>
  );
};

const PhoneS = ({ children, t0, t }: { children: React.ReactNode; t0: number; t: number }) => (
  <div style={{ position: 'absolute', left: 60, top: 440, width: 450 * .95, height: 860 * .95, ...pop(t, t0) }}>
    <div style={{ transform: 'scale(.95)', transformOrigin: '0 0' }}><Phone>{children}</Phone></div>
  </div>
);
const CO = (p: { t: number; t0: number; top: number; children: React.ReactNode; bg?: string; color?: string; fs?: number }) => (
  <Callout bg={p.bg} color={p.color} style={{ ...rise(p.t, p.t0), left: 520, top: p.top, width: 440, boxSizing: 'border-box', fontSize: p.fs ?? 42, padding: '22px 26px' }}>{p.children}</Callout>
);
// 휴대폰(0.8배) 안 좌표 → 화면 좌표: Ring 은 폰 내부(스케일 전) 좌표로 그림
const INPUT_Y = 860 - 32 - 46 - 26 - 92;

// [1] 훅: 깨알 같은 약 봉투
export const S01 = ({ t }: { t: number }) => {
  const t2 = at('s01_02');
  const mx = 300 + 260 * Math.sin(t * 1.3), my = 760 + 120 * Math.sin(t * 2.1);
  const out = eo(seg(t, t2, t2 + .5));
  return (
    <>
      <div style={{ position: 'absolute', left: 90, top: 470, width: 900, transform: `translateY(${-out * 40}px) scale(${1 - out * .45})`, transformOrigin: '50% 0', opacity: 1 - out * .25 }}>
        <MedBag fs={1.12} style={{ width: 900 }} />
        {t < t2 && (
          <div style={{ position: 'absolute', left: mx - 140, top: my - 470 - 140, width: 280, height: 280, borderRadius: '50%', border: '14px solid #3B2A20', background: 'rgba(255,255,255,.25)', backdropFilter: 'blur(3px)', boxShadow: '0 10px 30px rgba(0,0,0,.25)' }}>
            <div style={{ position: 'absolute', right: -95, bottom: -95, width: 34, height: 130, background: '#3B2A20', borderRadius: 17, transform: 'rotate(-45deg)' }} />
          </div>
        )}
      </div>
      <div style={{ ...pop(t, at('s01_01', .55)), position: 'absolute', left: 0, right: 0, top: 1100, textAlign: 'center', fontSize: 66, fontWeight: 900, color: C.red, opacity: t < t2 + .3 ? 1 : 0 }}>😣 글씨가 안 보여요</div>
      {t >= t2 + .2 && (
        <div style={{ ...pop(t, t2 + .2, .4), position: 'absolute', left: 60, right: 60, top: 960, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, fontSize: 70, fontWeight: 900 }}>
          📸 <span style={{ color: C.orange }}>→</span> 🤖 <span style={{ fontSize: 60 }}>AI가 읽어 줘요!</span>
        </div>
      )}
    </>
  );
};

// [2] 사진 찍기
export const S02 = ({ t }: { t: number }) => {
  const tCam = at('s02_01', 'end') + .1, tShot = at('s02_02', .45), tSent = at('s02_02', 'end') + .35;
  const cam = t >= tCam && t < tSent;
  const flash = clamp(1 - Math.abs(t - tShot) / .12);
  return (
    <>
      <PhoneS t={t} t0={SCENES[1].start + .1}>
        {cam ? (
          <div style={{ position: 'absolute', inset: 0, background: '#111', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 70 }}>
            <MedBag fs={.48} style={{ width: 384, transform: `rotate(-3deg) scale(${1 + .03 * Math.sin(t * 3)})` }} />
            <div style={{ position: 'absolute', inset: 40, border: '4px solid rgba(255,255,255,.6)', borderRadius: 18, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 60, width: 120, height: 120, borderRadius: 60, border: '10px solid #fff', background: t >= tShot - .05 && t < tShot + .2 ? '#ddd' : 'transparent' }} />
            <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: flash }} />
          </div>
        ) : (
          <>
            <div style={{ padding: '20px 26px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 30, fontWeight: 800 }}><AppIcon kind="chatgpt" size={56} />챗GPT</div>
              {t >= tSent && <div style={{ ...rise(t, tSent, .3), alignSelf: 'flex-end' }}><MedBag fs={.3} style={{ width: 240 }} /></div>}
            </div>
            <InputBar />
            <Ring t={t} t0={at('s02_01', .55)} x={30} y={INPUT_Y + 28} w={40} h={40} r={28} until={tCam} />
          </>
        )}
      </PhoneS>
      <CO t={t} t0={at('s02_01', .5)} top={470}>➕ / 📷 버튼<br />누르기</CO>
      <CO t={t} t0={at('s02_02', .3)} top={760} bg="#FFF2C9">약 봉투<br />찰칵! 📸</CO>
    </>
  );
};

// [3] 말로 물어보기
const Q = '이 약 언제, 어떻게 먹어야 하고, 주의할 점이 뭔지 알기 쉽게 설명해 줘';
export const S03 = ({ t }: { t: number }) => {
  const tLive = at('s03_01', 'end') + .05, tq = at('s03_02', .02);
  const live = t >= tLive;
  const q = typed(Q, t, tq, Array.from(Q).length / (at('s03_02', 'end') - tq));
  return (
    <>
      <PhoneS t={t} t0={SCENES[2].start}>
        {!live ? (
          <>
            <div style={{ padding: '20px 26px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 30, fontWeight: 800 }}><AppIcon kind="chatgpt" size={56} />챗GPT</div>
              <div style={{ alignSelf: 'flex-end' }}><MedBag fs={.3} style={{ width: 240 }} /></div>
            </div>
            <InputBar />
            <Ring t={t} t0={at('s03_01', .2)} x={418 - 12 - 60 - 10 - 36 - 8} y={INPUT_Y + 26} w={46} h={46} r={30} />
          </>
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#1B2140,#3A2F6B)', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 90 }}>
            <div style={{ position: 'relative', width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {[0, 1, 2].map(i => { const ph = ((t - tLive) * .8 + i / 3) % 1; return <div key={i} style={{ position: 'absolute', width: 110 + ph * 180, height: 110 + ph * 180, borderRadius: '50%', border: '6px solid #9FB6FF', opacity: 1 - ph }} />; })}
              <div style={{ width: 120, height: 120, borderRadius: 60, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MicIcon size={64} color="#3A2F6B" /></div>
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, opacity: .85, marginTop: 40 }}>듣고 있어요…</div>
            <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.45, margin: '40px 34px 0', textAlign: 'center' }}>{q}</div>
          </div>
        )}
      </PhoneS>
      <CO t={t} t0={at('s03_01', .3)} top={470}>🎤 마이크<br />누르고 말하기</CO>
      <CO t={t} t0={at('s03_02', .1)} top={760} bg="#E8EDFF" color="#3A2F6B" fs={36}>“언제, 어떻게 먹고<br />주의할 점은?”</CO>
    </>
  );
};

// [4] 대답: 큰 글씨 카드
export const S04 = ({ t }: { t: number }) => {
  const t2 = at('s04_02'), d2 = at('s04_02', 'end') - t2;
  const rows: [string, string, string][] = [
    ['🕗', '언제', '하루 2번\n아침·저녁 밥 먹고 30분 뒤'],
    ['💊', '얼마나', '한 번에 한 봉지씩\n3일 동안'],
    ['⚠️', '조심', '졸릴 수 있어요 → 운전 조심\n술은 드시지 마세요'],
  ];
  return (
    <>
      <div style={{ ...pop(t, SCENES[3].start + .1), position: 'absolute', left: 70, top: 440, fontSize: 40, fontWeight: 800, color: C.sub }}>🤖 AI 대답 예시</div>
      {rows.map(([e, k, v], i) => (
        <div key={k} style={{ ...rise(t, i === 0 ? at('s04_01', .4) : t2 + d2 * i / 3, .4, 40), position: 'absolute', left: 60, top: 510 + i * 262, width: 900, height: 240, boxSizing: 'border-box', background: '#fff', borderRadius: 30, boxShadow: '0 12px 30px rgba(60,40,20,.12)', display: 'flex', alignItems: 'center', gap: 24, padding: '0 30px', borderLeft: `14px solid ${i === 2 ? C.red : C.orange}` }}>
          <div style={{ fontSize: 76 }}>{e}</div>
          <div>
            <div style={{ fontSize: 34, fontWeight: 900, color: i === 2 ? C.red : C.orangeDark }}>{k}</div>
            <div style={{ fontSize: 46, fontWeight: 800, lineHeight: 1.3, whiteSpace: 'pre-line' }}>{v}</div>
          </div>
        </div>
      ))}
    </>
  );
};

// [5] 꼭 기억하세요
export const S05 = ({ t }: { t: number }) => {
  const cover = eo(seg(t, at('s05_02', .45), at('s05_02', .85)));
  return (
    <>
      <div style={{ ...pop(t, at('s05_01')), position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', fontSize: 66, fontWeight: 900, color: C.red }}>꼭 기억하세요! ☝️</div>
      <div style={{ ...rise(t, at('s05_02', .05)), position: 'absolute', left: 60, top: 560, width: 900, height: 400, boxSizing: 'border-box', background: '#fff', borderRadius: 30, boxShadow: '0 12px 30px rgba(60,40,20,.12)', padding: 26, display: 'flex', gap: 24, alignItems: 'center' }}>
        <MedBag fs={.66} cover={cover} style={{ width: 500, flexShrink: 0 }} />
        <div style={{ fontSize: 46, fontWeight: 900, lineHeight: 1.3 }}>✋ 이름은<br /><span style={{ color: C.orangeDark }}>가리고</span> 찍기</div>
      </div>
      <div style={{ ...rise(t, at('s05_03', .05)), position: 'absolute', left: 60, top: 990, width: 900, height: 270, boxSizing: 'border-box', background: '#E3F5EC', borderRadius: 30, padding: '0 34px', display: 'flex', gap: 26, alignItems: 'center' }}>
        <div style={{ fontSize: 96 }}>🧑‍⚕️</div>
        <div style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.3 }}>AI 설명은 <u>참고만</u><br /><span style={{ color: C.green }}>약사님께 한 번 더!</span></div>
      </div>
    </>
  );
};

// [6] 마무리
export const S06 = ({ t }: { t: number }) => {
  const tSub = at('s06_02');
  return (
    <>
      <div style={{ ...rise(t, SCENES[5].start + .1), position: 'absolute', left: 60, top: 470, width: 900, boxSizing: 'border-box', background: '#fff', borderRadius: 30, boxShadow: '0 12px 30px rgba(60,40,20,.12)', padding: 34 }}>
        <div style={{ fontSize: 56, fontWeight: 900 }}>📋 건강검진 결과표도 OK</div>
        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, fontSize: 30, fontWeight: 700, color: C.sub }}>
          {['혈압', '혈당', '콜레스테롤'].map(k => <div key={k} style={{ background: '#F6F1EA', borderRadius: 14, padding: '14px 0', textAlign: 'center' }}>{k}</div>)}
        </div>
        <div style={{ marginTop: 18, fontSize: 36, fontWeight: 800, color: C.orangeDark }}>“이 결과 쉽게 설명해 줘”</div>
      </div>
      {t >= tSub - .1 && (
        <div style={{ ...pop(t, tSub - .1), position: 'absolute', left: 0, right: 0, top: 1060, display: 'flex', justifyContent: 'center' }}>
          <div style={{ fontSize: 62, fontWeight: 900, color: '#fff', background: '#E5484D', borderRadius: 999, padding: '20px 64px', transform: `scale(${1 + .05 * Math.sin((t - tSub) * 6)})`, boxShadow: '0 12px 28px rgba(229,72,77,.35)' }}>🔔 구독하기</div>
        </div>
      )}
    </>
  );
};
