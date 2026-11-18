"""배경음악(직접 작곡) + 효과음 + AI 내레이션 → out/mix.wav (48 kHz 스테레오)
사용법:  cd <라이브러리 폴더> && .venv/bin/python <grandson-ai>/mix.py
- 시간은 모두 src/timeline.json (음성 길이로 만든 시간표)에서 읽음
- 음악: 100 BPM, F장조 F–C–Dm–B♭, 우쿨렐레·마림바·베이스·셰이커. 차분하고 따뜻하게, 목소리 아래 깔림
  [9] '조심하세요' 장면은 악기를 줄여 진지하게, 마지막 구독 화면에서 마무리 화음
- 효과음: 화면에 뭔가 나타날 때 '톡', 강조 테두리 '딸깍', 도장 '쿵', 타이핑, 사진 찰칵, 대답 '띵'
"""
import json, os, sys
import numpy as np, soundfile as sf, soxr
from scipy.signal import butter, sosfilt
from scipy.ndimage import uniform_filter1d, maximum_filter1d

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.getcwd())
from core.audio import sampler as S
from core.audio.sfx import SR, add, compress, limit, click, pop, whoosh, ding, thump

TL = json.load(open(os.path.join(HERE, 'src', 'timeline.json'), encoding='utf-8'))
DUR = TL['dur']; N = int(np.ceil(DUR * SR))
SC = {s['id']: s for s in TL['scenes']}
LN = {l['id']: l for s in TL['scenes'] for l in s['lines']}
def at(i, f=0.0): return LN[i]['start'] + LN[i]['dur'] * f
def hp(x, f): return sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x)
S.seed(5)

# ---------------- 음악 ----------------
BEAT = 60 / 100; BAR = 4 * BEAT
PROG = [('F1', ['F4', 'A4', 'C5'], ['F4', 'A4', 'C5', 'F5']), ('C2', ['E4', 'G4', 'C5'], ['C4', 'E4', 'G4', 'C5']),
        ('D2', ['F4', 'A4', 'D5'], ['D4', 'F4', 'A4', 'D5']), ('A#1', ['F4', 'A#4', 'D5'], ['A#3', 'D4', 'F4', 'A#4'])]
END = SC[10]['lines'][-1]['start'] + SC[10]['lines'][-1]['dur'] + .2       # 마지막 인사 끝 → 마무리 화음
calm0, calm1 = SC[9]['start'], SC[9]['end']
ev = []
def E(t, inst, p, d, v, pan=0, g=1.0): ev.append((t, inst, p, d, v, pan, g))
b = 0
while b * BAR < END - .01:
    t0 = b * BAR; bass, uke, arp = PROG[b % 4]
    calm = calm0 <= t0 < calm1
    for i, k in enumerate([0, 1, 2, 3, 2, 1, 2, 3]):                          # 마림바 8분 아르페지오
        if calm and i % 2: continue
        E(t0 + i * BEAT / 2, 'marimba', arp[k], .5, .34 if i % 2 else .42, -.3, .7)
    if not calm:
        for k in [1, 3]:                                                     # 우쿨렐레 2·4박 스트럼
            for j, n in enumerate(uke): E(t0 + k * BEAT + j * .014, 'ukulele', n, .35, .45, .3, .65)
        for k in range(8): E(t0 + k * BEAT / 2, 'shaker', 'down' if k % 2 == 0 else 'up', None, .28 if k % 2 else .36, .2, .35)
    for k in [0, 2]: E(t0 + k * BEAT, 'electric_bass', bass, BEAT * 1.6, .55, 0, .9)
    b += 1
for j, n in enumerate(['F4', 'A4', 'C5', 'F5']): E(END + j * .03, 'ukulele', n, 2.5, .55, .2, .8)
E(END, 'electric_bass', 'F1', 2.5, .6); E(END + .1, 'glockenspiel', 'C7', 2.5, .4, .3, .5); E(END + .25, 'glockenspiel', 'F7', 2.5, .35, .3, .45)
music = S.render(ev, dur=DUR)
music = S.room(music, size=.4, mix=.15)
music = music[:N] if len(music) >= N else np.pad(music, ((0, N - len(music)), (0, 0)))
fi = int(1.2 * SR); music[:fi] *= np.linspace(0, 1, fi)[:, None]

# ---------------- 효과음 ----------------
fx = np.zeros((N, 2), np.float32)
def P(t, g=.35, pan=.3): add(fx, pop(1.0), t, g, pan)                         # 톡 (등장)
def K(t, g=.35, pan=.3): add(fx, click(1.2, 1.0), t, g, pan)                  # 딸깍 (강조)
for s in TL['scenes'][1:]: add(fx, whoosh(.4, .7), s['start'] - .05, .18, .3)  # 장면 넘김
P(at('s01_04', .35)); P(at('s01_04', .6)); P(at('s01_05'))
P(at('s02_01', .25)); P(at('s02_01', .6))
d3 = LN['s02_03']['dur']
for i in range(3): P(at('s02_03') + d3 * i / 3 + .1, .3)
P(at('s02_05', .35))
P(at('s03_01', .05)); P(at('s03_01', .55)); P(at('s03_02')); P(at('s03_03', .3))
add(fx, thump(1.0), at('s03_04', .45), .55, .2)                                # 도장
for i, f in [('s04_03', .1), ('s04_06', .2), ('s06_02', .25), ('s06_05', .2), ('s07_02', .2), ('s05_03', .35), ('s08_02', .15)]: K(at(i, f))
for i, f in [('s04_03', .2), ('s04_04', .2), ('s04_06', .2), ('s04_09', .1), ('s05_02', .2), ('s05_03', .3), ('s06_02', .3), ('s06_05', .2),
             ('s07_01', .4), ('s07_03', .3), ('s07_04', .4), ('s08_02', .2), ('s08_04', .25), ('s08_05', .2)]: P(at(i, f), .22)
for k in range(7): add(fx, click(1.6 + .1 * (k % 3), .7), at('s04_04', .15) + k / 5, .2, .35)           # 'ChatGPT' 타이핑
tq = at('s06_04', .05); nq = 26; dq = at('s06_04', 1.0) - tq + .2
for k in range(nq): add(fx, click(1.6 + .1 * (k % 3), .7), tq + k * dq / nq, .16, .35)               # 질문 타이핑
add(fx, ding(1.0), at('s05_04', .55), .3, .3)                                  # 로그인 끝
add(fx, whoosh(.25, .8), at('s06_05', .6), .2, .3)                             # 보내기
add(fx, ding(1.0), at('s06_06', .3), .22, .3)                                  # 대답
add(fx, ding(1.0), at('s07_02', .75), .2, .3)                                  # 라이브 시작
tc = at('s08_02', .55)
add(fx, click(.7, 1.0), tc + .9, .4, .3); add(fx, click(1.3, 1.0), tc + .96, .3, .3)                     # 사진 찰칵
add(fx, whoosh(.25, .8), at('s08_03', .45), .2, .3); add(fx, ding(1.0), at('s08_03', 1.0) + .3, .22, .3)
for i in ['s09_02', 's09_03', 's09_05']: add(fx, thump(1.0, 90), at(i), .4, .2)
add(fx, thump(1.0), at('s09_05', .7), .55, .2)
d2 = LN['s10_02']['dur']
for i in range(3): P(at('s10_02') + d2 * i / 3, .3)
P(at('s10_03', .2)); P(at('s10_04', .2)); P(at('s10_06', .2))
add(fx, ding(1.0), at('s10_07', 1.0) + .1, .3, .3)

# ---------------- 목소리 ----------------
voice = np.zeros(N, np.float32)
for i, l in LN.items():
    y, sr = sf.read(os.path.join(HERE, 'voice', i + '.wav'), dtype='float32')
    if y.ndim > 1: y = y.mean(1)
    if sr != SR: y = soxr.resample(y, sr, SR)
    k = int(l['start'] * SR); voice[k:k + len(y)] += y[:N - k]
voice = hp(voice, 80)
voice = voice / (np.abs(voice).max() + 1e-9) * .9
voice = compress(voice, thr=.18, ratio=3.0)
voice = limit(voice, ceil=.8)

# 더킹 + 밸런스: 말할 때 목소리가 음악보다 약 14 dB 크게 (어르신용: 말이 또렷하게)
act = maximum_filter1d((np.abs(voice) > .02).astype(np.float32), size=int(.3 * SR))
duck = 1 - (1 - 10 ** (-6 / 20)) * uniform_filter1d(act, size=int(.15 * SR))
music *= duck[:, None]
def rms(x): return float(np.sqrt(np.mean(x ** 2)) + 1e-12)
sp = np.abs(voice) > .02
gm = rms(voice[sp]) / rms(music[sp].mean(1)) * 10 ** (-14 / 20); music *= gm
fx *= rms(voice[sp]) / (rms(fx[np.abs(fx).max(1) > .01].mean(1)) + 1e-9) * 10 ** (-10 / 20)   # 효과음은 목소리보다 약 10 dB 작게
mix = music + fx + np.stack([voice, voice], 1) * .95
fo = int(1.5 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
mix = np.stack([limit(mix[:, 0], .95), limit(mix[:, 1], .95)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR)
print('mix ok', f'{DUR:.1f}s', f'music {20*np.log10(gm):+.1f} dB')
print('\n'.join(S.credits(sorted({e[1] for e in ev}))))
