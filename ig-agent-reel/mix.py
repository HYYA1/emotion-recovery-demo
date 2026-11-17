"""배경음악(직접 작곡한 반주) + 한국어 내레이션 → out/mix.wav (48 kHz 스테레오)
사용법:  cd <라이브러리 폴더> && .venv/bin/python <ig-agent-reel>/mix.py
- 음악: 120 BPM (1박 0.5초, 1마디 2초, 25마디 = 50초), F장조, 코드 F–C–Dm–B♭ 반복
  악기: 우쿨렐레, 마림바, 일렉 베이스, 드럼(MuldjordKit), 박수, 글로켄슈필
- 장면 전환 박자에 맞춘 포인트: 2.5초 '끝났다', 6초 'INSTAGRAM AGENT', 10초 '무료', 28초 '바이럴',
  36–38초 '그래서' 브레이크(음악이 빠짐) → 38초 다시 시작, 48초 마지막 화음
- 음성: voice/<id>.wav 를 voice/schedule.json 시각에 배치. 말하는 동안 음악을 약 8 dB 낮춤(더킹)
"""
import json, os, sys
import numpy as np, soundfile as sf, soxr

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.getcwd())                      # 라이브러리 폴더에서 실행
from core.audio import sampler as S
from core.audio.sfx import SR, add, compress, limit

DUR, BEAT, BAR = 50.0, 0.5, 2.0
N = int(DUR * SR)
S.seed(7)

PROG = [  # (베이스 근음, 우쿨렐레 화음, 마림바 아르페지오)
    ('F1', ['F4', 'A4', 'C5'], ['F4', 'A4', 'C5', 'F5']),
    ('C2', ['E4', 'G4', 'C5'], ['C4', 'E4', 'G4', 'C5']),
    ('D2', ['F4', 'A4', 'D5'], ['D4', 'F4', 'A4', 'D5']),
    ('A#1', ['F4', 'A#4', 'D5'], ['A#3', 'D4', 'F4', 'A#4']),
]
BREAK0, BREAK1 = 36.0, 38.0          # '그래서' 쉬어가기
END_HIT = 48.0

ev = []
def E(t, inst, pitch, dur, vel, pan=0.0, gain=1.0): ev.append((t, inst, pitch, dur, vel, pan, gain))

for b in range(25):
    t0 = b * BAR
    bass, uke, arp = PROG[b % 4]
    intro = t0 < 2.5
    brk = BREAK0 <= t0 < BREAK1
    if t0 >= END_HIT: break
    # 마림바 8분음표 아르페지오 (항상, 브레이크 땐 없음)
    if not brk:
        pat = [0, 1, 2, 3, 2, 1, 2, 3]
        for i, k in enumerate(pat):
            E(t0 + i * BEAT / 2, 'marimba', arp[k], .4, .38 if i % 2 else .48, -.25, .8)
    if intro or brk: continue
    # 드럼: 킥 1·3박(+3박 뒤 8분), 스네어 2·4박, 하이햇 8분
    for k in [0, 2, 2.5]: E(t0 + k * BEAT, 'drum_kit', 'kick_drum_left', None, .7, 0, .9)
    for k in [1, 3]: E(t0 + k * BEAT, 'drum_kit', 'snare_1', None, .45, .05, .6)
    for i in range(8): E(t0 + i * BEAT / 2, 'drum_kit', 'hi_hat_closed', None, .32 if i % 2 else .42, .3, .45)
    if 24.0 <= t0 < BREAK0 or t0 >= BREAK1:
        for k in [1, 3]: E(t0 + k * BEAT, 'claps', 'group', None, .5, -.1, .45)
    # 베이스: 8분 근음 (옥타브 튕김)
    for i in range(8):
        p = S.midi(bass) + (12 if i in (3, 7) else 0)
        E(t0 + i * BEAT / 2, 'electric_bass', p, .22, .65 if i % 4 == 0 else .5, 0, 1.0)
    # 우쿨렐레: 엇박 짧은 스트럼
    for k in [0.5, 1.5, 2.5, 3.5]:
        for j, n in enumerate(uke): E(t0 + k * BEAT + j * .012, 'ukulele', n, .2, .55, .25, .7)

# 포인트(장면과 맞춤)
for t, notes in [(2.5, ['C6', 'F6', 'A6']), (6.0, ['A6', 'C7']), (10.0, ['F6', 'A6', 'C7', 'F7']), (28.0, ['C6', 'F6', 'A6', 'C7']), (38.0, ['F6', 'A6', 'C7'])]:
    for j, n in enumerate(notes): E(t + j * .06, 'glockenspiel', n, 1.2, .55, .35, .7)
for t in [2.5, 28.0, 38.0]:
    E(t, 'drum_kit', 'crash_left', None, .55, -.3, .55)
    E(t, 'drum_kit', 'kick_drum_left', None, .85, 0, 1.0)
# 브레이크: 36초에 화음이 울리고 남음 → 37초부터 스네어 몰아치기 → 38초 재시작
for j, n in enumerate(['F4', 'A4', 'C5']): E(BREAK0 + j * .02, 'ukulele', n, 1.6, .5, .2, .7)
E(BREAK0, 'glockenspiel', 'F6', 1.8, .45, .3, .6)
for i in range(8): E(37.0 + i * .125, 'drum_kit', 'snare_1', None, .25 + .06 * i, 0, .45)
# 마지막 화음 (48초) — 울림을 남기고 끝
for j, n in enumerate(['F4', 'A4', 'C5', 'F5']): E(END_HIT + j * .015, 'ukulele', n, 1.8, .6, .2, .75)
E(END_HIT, 'electric_bass', 'F1', 1.6, .7, 0, 1.0)
E(END_HIT, 'drum_kit', 'crash_left', None, .6, -.3, .6)
E(END_HIT, 'drum_kit', 'kick_drum_left', None, .85, 0, 1.0)
for j, n in enumerate(['F6', 'A6', 'C7', 'F7']): E(END_HIT + j * .08, 'glockenspiel', n, 1.8, .5, .35, .6)

music = S.render(ev, dur=DUR)
music = S.room(music, size=.35, mix=.14)
music = music[:N] if len(music) >= N else np.pad(music, ((0, N - len(music)), (0, 0)))

# 내레이션
sched = json.load(open(os.path.join(HERE, 'voice', 'schedule.json')))
voice = np.zeros(N, np.float32)
for vid, at in sched.items():
    y, sr = sf.read(os.path.join(HERE, 'voice', f'{vid}.wav'), dtype='float32')
    if y.ndim > 1: y = y.mean(1)
    if sr != SR: y = soxr.resample(y, sr, SR)
    i = int(at * SR); voice[i:i + len(y)] += y[:N - i]
voice = voice / (np.abs(voice).max() + 1e-9) * .9
voice = compress(voice, thr=.18, ratio=3.0)
voice = limit(voice, ceil=.8)

# 더킹: 말하는 구간에서 음악 약 −8 dB (0.12초 부드럽게)
from scipy.ndimage import uniform_filter1d, maximum_filter1d
act = maximum_filter1d((np.abs(voice) > .02).astype(np.float32), size=int(.25 * SR))
duck = 1 - (1 - 10 ** (-8 / 20)) * uniform_filter1d(act, size=int(.12 * SR))
music = music * duck[:, None]

def rms(x): return float(np.sqrt(np.mean(x ** 2)) + 1e-12)
speech = np.abs(voice) > .02
v_rms, m_rms = rms(voice[speech]), rms(music[speech].mean(1))
gain_m = v_rms / m_rms * 10 ** (-10 / 20)            # 말할 때 음성이 음악보다 약 10 dB 크게
music = music * gain_m
mix = music + np.stack([voice, voice], 1) * .95
fade = int(.6 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.5
mix = np.stack([limit(mix[:, 0], .95), limit(mix[:, 1], .95)], 1)
out = os.path.join(HERE, 'out', 'mix.wav'); os.makedirs(os.path.dirname(out), exist_ok=True)
sf.write(out, mix.astype(np.float32), SR)
print('mix', out, f'music gain {20*np.log10(gain_m):+.1f} dB')
print('\n'.join(S.credits(sorted({e[1] for e in ev}))))
