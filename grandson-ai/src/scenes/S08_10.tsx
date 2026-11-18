import React from 'react';
import { C, at, pop, rise, SCENES, seg, eo } from '../tl';
import { AppIcon, Bubble, Callout, InputBar, Panel, Phone, Ring, Stamp } from '../components/Ui';

// [8] 사진으로 물어보기
export const S08 = ({ t }: { t: number }) => {
  const sc = SCENES[7];
  const tCam = at('s08_02', .55), tSent = at('s08_03', .45), tAns = at('s08_03', 'end') + .3;
  const cam = t >= tCam && t < tSent;
  return (
    <Panel>
      <Phone x={40} y={0} style={pop(t, sc.start + .2)}>
        {cam ? (
          <div style={{ position: 'absolute', inset: 0, background: '#111', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ...pop(t, tCam, .25) }}>
            <div style={{ width: 360, height: 480, borderRadius: 20, background: 'linear-gradient(160deg,#E8E2D6,#C9BFAF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 220 }}>🪴</div>
            <div style={{ width: 110, height: 110, borderRadius: 55, border: '8px solid #fff', marginTop: 50, background: (t - tCam) % 1 < .12 ? '#ddd' : 'transparent' }} />
          </div>
        ) : (
          <>
            <div style={{ padding: '20px 26px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 30, fontWeight: 800 }}><AppIcon kind="gemini" size={56} />제미나이</div>
              {t >= tSent && (
                <div style={{ ...rise(t, tSent, .3), alignSelf: 'flex-end', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                  <div style={{ width: 170, height: 210, borderRadius: 20, background: 'linear-gradient(160deg,#E8E2D6,#C9BFAF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 110 }}>🪴</div>
                  <Bubble me>이 식물 이름이 뭐야?<br />물은 얼마나 줘야 돼?</Bubble>
                </div>
              )}
              {t >= tAns && (
                <Bubble style={rise(t, tAns, .35, 10)}>
                  <b>스투키(산세베리아)</b> 같아요.<br />흙이 바싹 마르면 물을 주세요.<br />보통 한 달에 한두 번이면 돼요.
                </Bubble>
              )}
            </div>
            <InputBar />
            <Ring t={t} t0={at('s08_02', .15)} x={18 + 12} y={860 - 32 - 46 - 26 - 92 + 28} w={40} h={40} r={28} until={tCam} />
          </>
        )}
      </Phone>
      <Callout style={{ ...rise(t, at('s08_02', .2)), left: 560, top: 60, width: 560 }}>➕ 버튼이나 📷 카메라<br />→ 사진 찍어 보내기</Callout>
      <Callout style={{ ...rise(t, at('s08_04', .25)), left: 560, top: 360, width: 560 }} bg="#FFF2C9">영어 안내문·설명서도<br />“이거 무슨 말이야?” 📄</Callout>
      <Callout style={{ ...rise(t, at('s08_05', .2)), left: 560, top: 650, width: 560, fontSize: 36 }} color={C.sub}>무료는 하루에 보낼 수 있는<br />사진 수가 정해져 있을 수 있어요</Callout>
    </Panel>
  );
};

// [9] 이것만은 조심하세요
export const S09 = ({ t }: { t: number }) => {
  const items: [string, string, string, string, number][] = [
    ['1', '🔒', '주민등록번호 · 통장 비밀번호 · 카드 번호', '절대 쓰지 마세요', at('s09_02')],
    ['2', '⚠️', 'AI도 틀릴 때가 있어요', '약 · 병 · 돈은 의사·약사·은행에 한 번 더', at('s09_03')],
    ['3', '🚫', '“돈 보내라” “링크 누르라”', '= 사기예요', at('s09_05')],
  ];
  return (
    <Panel>
      <div style={{ ...rise(t, SCENES[8].start + .3), position: 'absolute', left: 30, top: 0, fontSize: 64, fontWeight: 900 }}>이것만은 꼭 지켜 주세요 🙏</div>
      {items.map(([n, icon, a, b, t0], i) => (
        <div key={n} style={{ ...rise(t, t0, .45, 40), position: 'absolute', left: 30, top: 120 + i * 245, width: 1100, height: 215, boxSizing: 'border-box', background: '#fff', borderRadius: 34, boxShadow: '0 14px 34px rgba(60,40,20,.12)', display: 'flex', alignItems: 'center', gap: 30, padding: '0 40px', borderLeft: `16px solid ${i === 1 ? C.orange : C.red}` }}>
          <div style={{ fontSize: 96 }}>{icon}</div>
          <div>
            <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 1.25 }}>{a}</div>
            <div style={{ fontSize: 42, fontWeight: 800, color: i === 1 ? C.orangeDark : C.red, marginTop: 8 }}>{b}</div>
          </div>
        </div>
      ))}
      <Stamp t={t} t0={at('s09_05', .7)} style={{ left: 880, top: 600 }}>사기!</Stamp>
    </Panel>
  );
};

// [10] 마무리
export const S10 = ({ t }: { t: number }) => {
  const steps = ['앱 깔기', 'Google로\n계속하기', '맨 아래 칸에\n물어보기'];
  const t2 = at('s10_02'), d2 = at('s10_02', 'end') - t2;
  const tEnd = at('s10_07', 'end');
  const sub = t >= tEnd + .1;
  return (
    <Panel>
      <div style={{ ...rise(t, SCENES[9].start + .3), position: 'absolute', left: 30, top: 0, fontSize: 60, fontWeight: 900 }}>오늘 배운 것 정리 📝</div>
      <div style={{ position: 'absolute', left: 30, top: 110, display: 'flex', alignItems: 'center', gap: 22 }}>
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div style={{ ...pop(t, t2 + d2 * i / 3), width: 300, height: 210, background: '#fff', borderRadius: 30, boxShadow: '0 12px 30px rgba(60,40,20,.12)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <div style={{ width: 64, height: 64, borderRadius: 32, background: C.orange, color: '#fff', fontSize: 38, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</div>
              <div style={{ fontSize: 40, fontWeight: 900, textAlign: 'center', whiteSpace: 'pre-line', lineHeight: 1.2 }}>{s}</div>
            </div>
            {i < 2 && <div style={{ ...pop(t, t2 + d2 * (i + .7) / 3), fontSize: 60, color: C.orange, fontWeight: 900 }}>→</div>}
          </React.Fragment>
        ))}
      </div>
      <div style={{ ...rise(t, at('s10_03', .2)), position: 'absolute', left: 30, top: 380, width: 1060, background: '#FFF2C9', borderRadius: 30, padding: '30px 40px', fontSize: 52, fontWeight: 900, lineHeight: 1.3 }}>
        ✏️ 오늘의 숙제<br /><span style={{ color: C.orangeDark }}>궁금한 거 딱 하나만 물어보기</span>
      </div>
      <div style={{ ...pop(t, at('s10_04', .2)), position: 'absolute', left: 30, top: 640, fontSize: 44, fontWeight: 800, background: '#fff', borderRadius: 999, padding: '14px 34px', boxShadow: '0 10px 24px rgba(60,40,20,.1)' }}>💬 잘 안 되면 댓글로 물어보세요</div>
      <div style={{ ...pop(t, at('s10_06', .2)), position: 'absolute', left: 30, top: 750, fontSize: 40, fontWeight: 800, color: C.sub }}>다음 편 ▶ AI로 손주에게 보낼 문자 쓰기</div>
      {sub && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: -30, background: '#FFF7EC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34, ...pop(t, tEnd + .1) }}>
          <div style={{ fontSize: 72, fontWeight: 900 }}>옆집 손주가 알려주는 AI</div>
          <div style={{ display: 'flex', gap: 26 }}>
            <div style={{ fontSize: 52, fontWeight: 900, color: '#fff', background: '#E5484D', borderRadius: 999, padding: '18px 54px', transform: `scale(${1 + .05 * Math.sin((t - tEnd) * 6)})` }}>구독하기</div>
            <div style={{ fontSize: 52, fontWeight: 900, background: '#fff', borderRadius: 999, padding: '18px 40px', boxShadow: '0 10px 24px rgba(60,40,20,.1)' }}>🔔 알림 설정</div>
          </div>
        </div>
      )}
    </Panel>
  );
};
