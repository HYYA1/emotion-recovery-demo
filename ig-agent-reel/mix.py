"""배경음악(릴스용으로 직접 작곡한 트랩팝) + 한국어 내레이션 → out/mix.wav (48 kHz 스테레오)
사용법:  cd <라이브러리 폴더> && .venv/bin/python <ig-agent-reel>/mix.py
음악: 120 BPM 하프타임(스네어는 3박), A단조, 코드 Am–F–C–G 반복, 1마디 2초 · 25마디 = 50초
  808 베이스(신스) · 슈퍼소우 패드(사이드체인 펌핑) · 신스 플럭 멜로디 · 킥/박수/하이햇(MuldjordKit, CC0 박수)
포인트: 0–2.5초 필터 걸린 인트로 → 라이저 → 2.5초 '끝났다' 드롭 / 28초 '바이럴' 임팩트
        36초 '그래서' 테이프 스톱으로 음악이 멈춤 → 37–38초 라이저 → 38초 다시 드롭 / 48초 마지막 임팩트
        배경색이 바뀌는 슬라이드 전환(4·8·28·30·36·38초)마다 휙 소리
음성: voice/<id>.wav 를 voice/schedule.json 시각에 배치, 말하는 동안 음악을 약 8 dB 낮춤
"""
import json, os, sys
import numpy as np, soundfile as sf, soxr
from scipy.signal import butter, sosfilt, sosfiltfilt
from scipy.ndimage import uniform_filter1d, maximum_filter1d

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.getcwd())                      # 라이브러리 폴더에서 실행
from core.audio import sampler as S
from core.audio.sfx import SR, add, compress, limit, whoosh

rng = np.random.default_rng(11); S.seed(11)
DUR, BEAT, BAR = 50.0, 0.5, 2.0
N = int(DUR * SR)
DROP1, VIRAL, BRK0, BRK1, END = 2.5, 28.0, 36.0, 38.0, 48.0
SLIDES = [4.0, 8.0, 28.0, 30.0, 36.0, 38.0]
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)
PROG = [(45, [57, 60, 64]), (41, [53, 57, 60]), (48, [60, 64, 67]), (43, [55, 59, 62])]   # Am F C G (베이스 midi, 패드)

def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def tt(d): return np.arange(int(d * SR)) / SR
def st(x, pan=0.0): return np.stack([x * np.cos((pan + 1) * np.pi / 4), x * np.sin((pan + 1) * np.pi / 4)], 1) * 1.414
def place(buf, x, at, g=1.0):
    i = int(at * SR); n = min(len(x), len(buf) - i)
    if n > 0: buf[i:i + n] += x[:n] * g

def b808(m, d):
    t = tt(d); f = hz(m) * (1 + 1.2 * np.exp(-t / .035))
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .55) * np.minimum(1, t / .003)
    return np.tanh(y * 2.2) / np.tanh(2.2)
def saw(f, t, ph=0.0): return 2 * ((f * t + ph) % 1) - 1
def pad(notes, d):
    t = tt(d); y = np.zeros_like(t)
    for m in notes:
        for k, det in enumerate([-.11, -.06, -.02, 0, .02, .06, .11]):
            y += saw(hz(m) * 2 ** (det / 12), t, rng.random()) / 7
    env = np.minimum(1, t / .04) * np.minimum(1, (d - t) / .08)
    return lp(y, 5200) * env / len(notes)
def pluck(m, d=.35):
    t = tt(d); f = hz(m)
    y = (saw(f, t) * .6 + np.sign(np.sin(2 * np.pi * f * 1.003 * t)) * .4) * np.exp(-t / .12)
    return lp(y, 6000) * np.minimum(1, t / .002)
def noise(d): return rng.standard_normal(int(d * SR))
def riser(d):
    t = tt(d); y = noise(d); out = np.zeros_like(y)
    for i, (a, b) in enumerate(zip(np.linspace(300, 6000, 24)[:-1], np.linspace(300, 6000, 24)[1:])):
        s = int(len(y) * i / 23); e = int(len(y) * (i + 1) / 23)
        out[s:e] = sosfilt(butter(2, [a, b * 1.5], 'band', fs=SR, output='sos'), y)[s:e]
    return out * (t / d) ** 2 * .6
def impact(d=1.6):
    t = tt(d); boom = np.sin(2 * np.pi * np.cumsum(55 * (1 + 2 * np.exp(-t / .06))) / SR) * np.exp(-t / .5)
    return np.tanh(2 * boom) * .5 + lp(noise(d), 4000) * np.exp(-t / .25) * .25

drums, bass, pads, lead, fx = (np.zeros((N, 2), np.float32) for _ in range(5))
ev = []   # 샘플 드럼
for b in range(25):
    t0 = b * BAR
    if t0 >= END: break
    root, ch = PROG[b % 4]
    brk = BRK0 <= t0 < BRK1
    intro = t0 < DROP1
    if brk: continue
    # 패드 (인트로는 필터로 어둡게)
    p = pad(ch, BAR)
    if intro: p = lp(p, 1400)
    add(pads, p, t0, .9 if intro else .42, -.15); add(pads, p, t0 + .011, .35, .25)
    if intro and t0 + BAR <= DROP1:
        pass
    if t0 + BAR <= DROP1: continue
    # 808: 1박, 2.5박(=3박 앞 8분), 4박 뒤 16분 (트랩 패턴)
    for k, dd in [(0, 1.1), (1.5, .45), (3.5, .45)]:
        tt0 = t0 + k * BEAT
        if tt0 >= DROP1 - 1e-6: place(bass[:, 0], b808(root - 12 + 12 * (k == 3.5), dd), tt0, .8); place(bass[:, 1], b808(root - 12 + 12 * (k == 3.5), dd), tt0, .8)
    # 킥(808과 겹쳐 펀치), 박수+스네어 3박, 하이햇 16분 (+ 장면 전환 앞 셋잇단 롤)
    for k in [0, 1.5]: ev.append((t0 + k * BEAT, 'drum_kit', 'kick_drum_left', None, .8, 0, .6))
    ev.append((t0 + 2 * BEAT, 'claps', 'group', None, .75, 0, .8))
    ev.append((t0 + 2 * BEAT, 'drum_kit', 'snare_1', None, .55, 0, .5))
    roll = any(abs((t0 + BAR) - s) < 1e-6 for s in SLIDES + [BRK0])
    for i in range(16 if not roll else 12):
        ev.append((t0 + i * BEAT / 4, 'drum_kit', 'hi_hat_closed', None, .5 if i % 4 == 0 else .36, .25, .75))
    if roll:
        for i in range(12): ev.append((t0 + 1.5 + i * BEAT / 6, 'drum_kit', 'hi_hat_closed', None, .25 + .02 * i, .25, .42))
    # 플럭 멜로디 (8초부터, 2마디 모티프)
    if t0 >= 8.0:
        mot = [(0, 0), (.5, 2), (1, 4), (1.75, 2), (2.5, 0), (3, 7), (3.5, 4)] if b % 2 == 0 else [(0, 4), (.5, 2), (1, 0), (2, 2), (2.5, 4), (3.25, 7)]
        scale = [69, 72, 74, 76, 79, 81, 84, 86]
        for k, s in mot:
            add(lead, pluck(scale[s] if s < len(scale) else scale[-1]), t0 + k * BEAT, .28, .3)
            add(lead, pluck(scale[s] if s < len(scale) else scale[-1]), t0 + k * BEAT + .1875, .1, -.4)   # 점8분 딜레이

# 사이드체인 펌핑 (킥마다 패드·멜로디가 숨쉬듯)
tline = np.arange(N) / SR; phase = tline % BEAT
pump = 1 - .55 * np.exp(-phase / .11)
pump[tline < DROP1] = 1
pads *= pump[:, None]; lead *= pump[:, None]

# FX: 라이저 → 임팩트, 휙
for at, d in [(DROP1, 2.3), (VIRAL, 1.0), (BRK1, 1.0)]:
    add(fx, riser(d), at - d, .5)
for at in [DROP1, VIRAL, BRK1, END]:
    add(fx, impact(), at, .7)
    ev.append((at, 'drum_kit', 'crash_left', None, .6, -.2, .6))
for at in SLIDES:
    add(fx, whoosh(.32, .8), at - .16, .35, .3)
# 마지막: 패드 화음 + 808 길게
add(pads, pad([57, 60, 64, 69], 1.9), END, .45)
place(bass[:, 0], b808(33, 1.8), END, .8); place(bass[:, 1], b808(33, 1.8), END, .8)

samp = S.render(ev, dur=DUR)
samp = samp[:N] if len(samp) >= N else np.pad(samp, ((0, N - len(samp)), (0, 0)))
music = drums + samp + bass * .26 + pads + lead * 1.3 + fx
music = S.room(music, size=.3, mix=.1)
music[:, 0] = hp(music[:, 0], 28); music[:, 1] = hp(music[:, 1], 28)

# 테이프 스톱: 36초에 0.45초 동안 재생 속도가 0으로 떨어지며 멈춤 → 38초까지 무음(라이저·휙만)
i0, L = int(BRK0 * SR), int(.45 * SR)
seg = music[i0 - L: i0].copy()
rate = np.linspace(1, 0, 2 * L); pos = np.cumsum(rate); pos = pos / pos[-1] * (L - 1)
stop = np.stack([np.interp(pos, np.arange(L), seg[:, c]) for c in range(2)], 1) * np.linspace(1, 0, 2 * L)[:, None]
music[i0 - L: i0 + L] = stop
music[i0 + L: int(BRK1 * SR)] = 0
music[int((BRK1 - 1.0) * SR): int(BRK1 * SR)] += fx[int((BRK1 - 1.0) * SR): int(BRK1 * SR)]

# 내레이션
sched = json.load(open(os.path.join(HERE, 'voice', 'schedule.json')))
voice = np.zeros(N, np.float32)
for vid, at in sched.items():
    y, sr = sf.read(os.path.join(HERE, 'voice', f'{vid}.wav'), dtype='float32')
    if y.ndim > 1: y = y.mean(1)
    if sr != SR: y = soxr.resample(y, sr, SR)
    i = int(at * SR); voice[i:i + len(y)] += y[:N - i]
voice = hp(voice, 80)
voice = voice / (np.abs(voice).max() + 1e-9) * .9
voice = compress(voice, thr=.18, ratio=3.0)
voice = limit(voice, ceil=.8)

# 더킹: 말하는 동안 음악 약 −8 dB
act = maximum_filter1d((np.abs(voice) > .02).astype(np.float32), size=int(.25 * SR))
duck = 1 - (1 - 10 ** (-8 / 20)) * uniform_filter1d(act, size=int(.12 * SR))
music = music * duck[:, None]
def rms(x): return float(np.sqrt(np.mean(x ** 2)) + 1e-12)
speech = np.abs(voice) > .02
gain_m = rms(voice[speech]) / rms(music[speech].mean(1)) * 10 ** (-9 / 20)    # 말할 때 음성이 음악보다 약 9 dB 크게
music *= gain_m
mix = music + np.stack([voice, voice], 1) * .95
fade = int(.5 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.5
mix = np.stack([limit(mix[:, 0], .95), limit(mix[:, 1], .95)], 1)
out = os.path.join(HERE, 'out', 'mix.wav'); os.makedirs(os.path.dirname(out), exist_ok=True)
sf.write(out, mix.astype(np.float32), SR)
sf.write(os.path.join(HERE, 'out', 'music_only.wav'), (music / (np.abs(music).max() + 1e-9) * .9).astype(np.float32), SR)
print('mix', out, f'music gain {20*np.log10(gain_m):+.1f} dB')
print('\n'.join(S.credits(sorted({e[1] for e in ev}))))
