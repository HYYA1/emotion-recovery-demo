"""Voice + score + foley -> out/mix.wav, all timed from events.json (exported from the page).
Run from the library root:  $LIB/.venv/bin/python <project>/mix.py
Two resolutions in the music: a hi-fi band (vibraphone, nylon guitar, soft bass, kick and shaker) is the world;
a band-limited square wave is the mascot (its pops, jumps and the four karaoke notes)."""
import sys, os, json
import numpy as np, soundfile as sf, soxr
LIB = os.environ.get('LIB', os.getcwd()); sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio.sfx import SR, add, limit, noise, bp, lp, hp, compress

HERE = os.path.dirname(os.path.abspath(__file__))
EVJ = json.load(open(os.path.join(HERE, 'events.json'))); E = EVJ['ev']; DUR = EVJ['dur']
N = int((DUR + .5) * SR)
rng = np.random.default_rng(11); S.seed(11)
B = .6                                   # 100 BPM
def tt(d): return np.arange(int(round(d * SR))) / SR
def db(x): return 10 ** (x / 20)
def ev(tp): return [e for e in E if e['type'] == tp]

# ---------------- voice ----------------
vo = np.zeros((N, 2), np.float32)
for e in ev('vo'):
    x, sr = sf.read(os.path.join(HERE, 'voices', e['id'] + '.wav'), dtype='float32')
    if x.ndim > 1: x = x.mean(1)
    x = soxr.resample(x, sr, SR)
    x = compress(x, thr=.2, ratio=3)
    x = x / (np.sqrt((x ** 2).mean()) + 1e-9) * .1          # equal loudness per line
    add(vo, x, e['t'], 1.0, 0)

# ---------------- pixel layer ----------------
def pulse(f, d, duty=.25, vol=1., att=.003, rel=.04, slide=None):
    t = tt(d); fr = np.full(len(t), float(f)) if slide is None else f * (slide ** (t / d))
    ph = np.cumsum(fr) / SR; x = np.zeros(len(t))
    for k in range(1, 20):
        m = fr * k < 15000
        x += m * (np.sin(np.pi * k * duty) / k) * np.cos(2 * np.pi * k * (ph - duty / 2))
    e = np.minimum(1, t / att) * np.clip((d - t) / rel, 0, 1)
    return (x * e * vol * .5).astype(np.float32)
chip = np.zeros((N, 2), np.float32)
hz = S.hz
for e in ev('pop'):
    for i, n in enumerate(['C5', 'E5', 'G5', 'C6']): add(chip, pulse(hz(n), .07), e['t'] + i * .045, .22, .1)
for e in ev('unpop'):
    for i, n in enumerate(['G5', 'C5']): add(chip, pulse(hz(n), .07), e['t'] + i * .05, .15, .1)
for e in ev('jump'): add(chip, pulse(hz('C5'), .14, slide=2.0), e['t'], .14, 0)
for e in ev('land'): add(chip, pulse(hz('C3'), .07, duty=.5), e['t'], .16, 0)
for e in ev('step8'): add(chip, pulse(hz('G4'), .03, duty=.5), e['t'], .06, 0)
for e in ev('qblip'): add(chip, pulse(hz('E5'), .12, slide=1.4), e['t'], .16, .2); add(chip, pulse(hz('A5'), .14, slide=.8), e['t'] + .15, .16, .2)
for e in ev('sparkle'):
    for i, n in enumerate(['E6', 'G6', 'C7', 'G6', 'C7']): add(chip, pulse(hz(n), .05), e['t'] + i * .06, .09, .25)
for e in ev('heart'):
    for i, n in enumerate(['G5', 'C6']): add(chip, pulse(hz(n), .12), e['t'] + i * .1, .16, 0)
for e in ev('toss'): add(chip, pulse(hz('C6'), .35, slide=.25), e['t'], .14, .4)
for e in ev('hop'): add(chip, pulse(hz(['C5', 'E5', 'G5', 'C6'][e['n']]), .3, duty=.5, rel=.15), e['t'], .2, 0)

# ---------------- band ----------------
PROG = [('F2', ['F3', 'A3', 'C4', 'E4']), ('A2', ['E3', 'A3', 'C4', 'E4']), ('A#1', ['F3', 'A#3', 'D4', 'F4']), ('C2', ['E3', 'G3', 'C4', 'G4'])]
T0 = 0.0
sc = []
def bar(t): return int(np.floor((t - T0) / (4 * B) + 1e-6))
DROP = (31.95, 32.9)                                       # everything out while the AI reads
END = 58.75
def on(t): return not (DROP[0] <= t < DROP[1]) and t < END
t = 0.0
while t < END:
    b = bar(t); bass, ch = PROG[b % 4]
    if on(t):
        # vibraphone: chord on beat 1, soft
        for k, p in enumerate(ch): sc.append((t + k * .012, 'vibraphone', p, 2.2, .32 if t < 18.2 else .38, -.15 + .1 * k))
        if t >= 7.2:                                       # nylon guitar eighths from the problem section on
            for i in range(8):
                ti = t + i * B / 2
                if on(ti) and ti < END: sc.append((ti, 'guitar_nylon', ch[[0, 2, 1, 3, 2, 1, 3, 2][i] % 4], .5, .26 + .06 * (i % 2 == 0), .3))
    t += 4 * B
mus = S.render(sc, dur=N / SR)[:N]
# synth bass, kick and shaker from step 1 (18.2) on
band = np.zeros((N, 2), np.float32)
def bassnote(f, d):
    t = tt(d); x = np.sin(2 * np.pi * f * t) + .35 * np.sin(4 * np.pi * f * t) + .18 * np.sin(6 * np.pi * f * t)
    return (x * np.exp(-t / .5) * np.minimum(1, t / .01)).astype(np.float32)
def kick():
    t = tt(.3); f = 50 + 70 * np.exp(-t / .03); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .12)).astype(np.float32)
def shaker():
    return (hp(noise(.06), 5000) * np.exp(-tt(.06) / .015)).astype(np.float32)
t = 0.0
while t < END:
    bass, ch = PROG[bar(t) % 4]
    for beat in range(4):
        tb = t + beat * B
        if tb < 18.2 or not on(tb) or tb >= END: continue
        if beat in (0, 2): add(band, bassnote(hz(bass) * 2, B * 1.8), tb, .16, 0); add(band, kick(), tb, .3, 0)
        for h in (0, .5): add(band, shaker(), tb + h * B, .06 if h else .035, .35)
    t += 4 * B
# the answer lands: a vibraphone chord; the end: a held final chord
fin = S.render([(DROP[1], 'vibraphone', p, 2.5, .5, 0) for p in ['F3', 'A3', 'C4', 'E4', 'G4']] +
               [(END, 'vibraphone', p, 3.0, .45, 0) for p in ['F3', 'C4', 'E4', 'A4']] + [(END, 'guitar_nylon', 'F2', 3.0, .5, 0)], dur=N / SR)[:N]
music = mus + band + fin * .9
music = S.room(music, size=.35, mix=.15)

# ---------------- foley ----------------
fx = np.zeros((N, 2), np.float32)
def env(d, tau): return np.exp(-tt(d) / tau)
def tap(): d = .05; return (bp(noise(d), 1800, 6000) * env(d, .006)).astype(np.float32)
def swish(d=.35, lo=600, hi=5000):
    t = tt(d); x = bp(noise(d), lo, hi) * np.sin(np.pi * t / d) ** 2; return x.astype(np.float32)
def bell(fs, d=1.2):
    t = tt(d); return sum(np.sin(2 * np.pi * f * t) * np.exp(-t / .35) * a for f, a in fs).astype(np.float32)
def bloop(up=True):
    t = tt(.16); f = (500 if up else 900) * ((1.8 if up else .55) ** (t / .16)); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / .16)).astype(np.float32)
def shutter():
    x = np.zeros(int(.25 * SR), np.float32)
    for dt in (0, .09): s = int(dt * SR); c = bp(noise(.04), 2000, 8000) * env(.04, .005); x[s:s + len(c)] += c
    return x + (lp(noise(.25), 3000) * env(.25, .04) * .3).astype(np.float32)
for e in E:
    t, tp = e['t'], e['type']
    if tp == 'tap': add(fx, tap(), t, .35, 0)
    elif tp == 'swish': add(fx, swish(), t, .12, 0)
    elif tp == 'open': add(fx, swish(.28, 300, 3000), t, .14, 0)
    elif tp == 'close': add(fx, swish(.25, 800, 4000), t, .1, 0)
    elif tp == 'shutter': add(fx, shutter(), t, .45, 0)
    elif tp == 'micon': add(fx, bloop(True), t, .2, 0)
    elif tp == 'micoff': add(fx, bloop(False), t, .2, 0)
    elif tp == 'whoosh': add(fx, swish(.4, 400, 6000), t, .16, 0)
    elif tp == 'send': add(fx, swish(.9, 300, 6000), t, .18, .3)
    elif tp == 'chime': add(fx, bell([(1318, 1), (1976, .6)]), t, .12, 0); add(fx, bell([(1760, 1), (2637, .5)]), t + .12, .12, 0)
    elif tp == 'notif':
        for i, f in enumerate([1046, 1318, 1568]): add(fx, bell([(f, 1)], .8), t + i * .1, .1, 0)
    elif tp == 'done':
        for i, f in enumerate([1318, 1760]): add(fx, bell([(f, 1)], .9), t + i * .12, .12, 0)
    elif tp == 'chapter': add(fx, swish(.3, 1500, 7000), t - .05, .06, 0)
room = (lp(noise(N / SR), 300) * .004).astype(np.float32)

# ---------------- mix: music ducked ~10 dB under the voice ----------------
vabs = np.abs(vo).max(1); win = int(.05 * SR)
venv = np.convolve(vabs, np.ones(win) / win, mode='same')
duck = np.where(venv > .01, 1.0, 0.0)
k = int(.15 * SR); duck = np.convolve(duck, np.ones(k) / k, mode='same')
mg = db(3.5) * (1 - duck * (1 - db(-10)))
mix = vo * 1.0 + (music + chip * .9) * mg[:, None] + fx + room[:, None]
mix = limit(mix, .95)[:int(DUR * SR)]
fade = np.ones(len(mix)); fade[-int(.5 * SR):] = np.linspace(1, 0, int(.5 * SR)); mix *= fade[:, None]
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'out', 'mix.wav')
sf.write(out, mix.astype(np.float32), SR)
# report the balance: voice vs music RMS while the voice speaks
m = venv[:len(mix)] > .01
vr = np.sqrt((vo[:len(mix)][m] ** 2).mean()); mr = np.sqrt((((music + chip) * mg[:, None])[:len(mix)][m] ** 2).mean())
print(f'mix {out} {len(mix) / SR:.2f}s  voice over music: {20 * np.log10(vr / mr):.1f} dB')
