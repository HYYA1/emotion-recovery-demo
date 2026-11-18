"""Voice + score + foley -> out/mix.wav, all timed from events.json (exported from the page).
Run from the library root:  $LIB/.venv/bin/python <project>/mix.py
Two resolutions in the music: a punchy 120 BPM band (kick, clap, hats, pumping saw bass, chord stabs) is the world;
a band-limited square wave is the mascot: its pops and jumps, the karaoke notes, and the two-bar hook."""
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

# ---------------- band: 120 BPM pop groove (A minor: Am F C G), all synthesised ----------------
B = .5; BAR = 4 * B; END = 58.75; DROP = (31.95, 32.9)
def saw(f, d, n=24):
    t = tt(d); x = np.zeros(len(t))
    for k in range(1, n + 1):
        if f * k > 16000: break
        x += np.sin(2 * np.pi * f * k * t) / k
    return x
def kick():
    t = tt(.35); f = 45 + 110 * np.exp(-t / .025)
    return (np.tanh(2.2 * np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.exp(-t / .16)).astype(np.float32)
def clap():
    x = np.zeros(int(.25 * SR))
    for dt in (0, .011, .022): s0 = int(dt * SR); c = bp(noise(.2), 900, 3200) * np.exp(-tt(.2) / .045); x[s0:s0 + len(c)] += c[:len(x) - s0]
    return (x / np.abs(x).max()).astype(np.float32)
def hat(open_=False):
    d = .25 if open_ else .05; return (hp(noise(d), 7000) * np.exp(-tt(d) / (.09 if open_ else .012))).astype(np.float32)
def stab(notes, d=.22):
    x = sum(saw(hz(n), d, 12) for n in notes); x = lp(x, 2600) * np.exp(-tt(d) / .09)
    return (x / (np.abs(x).max() + 1e-9)).astype(np.float32)
def bassn(n, d):
    x = saw(hz(n), d, 16); x = lp(x, 900) * np.minimum(1, tt(d) / .005) * np.clip((d - tt(d)) / .02, 0, 1)
    return (np.tanh(1.5 * x / (np.abs(x).max() + 1e-9))).astype(np.float32)
def impact():
    t = tt(1.6); boom = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-t / .05)) / SR) * np.exp(-t / .45)
    return (boom + hp(noise(1.6), 3000) * np.exp(-t / .5) * .5).astype(np.float32)
def riser(d):
    t = tt(d); x = bp(noise(d), 800, 9000) * (t / d) ** 2.5; return x.astype(np.float32)
PROG = [('A1', ['A3', 'C4', 'E4']), ('F1', ['F3', 'A3', 'C4']), ('C2', ['G3', 'C4', 'E4']), ('G1', ['G3', 'B3', 'D4'])]
HOOK = [(0, 'E5', 1), (1, 'A5', 1), (2, 'C6', 1), (3, 'A5', 1), (4, 'E6', 2), (6, 'D6', 1), (7, 'C6', 1),
        (8, 'D6', 1), (9, 'C6', 1), (10, 'A5', 1), (11, 'G5', 1), (12, 'A5', 3), (15, 'E5', 1)]
def section(t):
    if t < 7.2: return 'full'
    if t < 18.2: return 'low'           # the problem: filtered, half energy, no lead
    if DROP[0] <= t < DROP[1]: return 'off'
    if t >= END: return 'off'
    return 'full'
drums = np.zeros((N, 2), np.float32); bass = np.zeros((N, 2), np.float32); keys = np.zeros((N, 2), np.float32); lead = np.zeros((N, 2), np.float32)
pump = np.ones(N, np.float32)
for i in range(int(END / B) + 1):
    t = i * B; sec = section(t)
    if sec == 'off': continue
    beat = i % 4; root, ch = PROG[(i // 4) % 4]
    if sec == 'full' or beat in (0, 2):
        add(drums, kick(), t, .55, 0)
        k0 = int(t * SR); n = min(int(.22 * SR), N - k0); pump[k0:k0 + n] = np.minimum(pump[k0:k0 + n], .35 + .65 * np.linspace(0, 1, n) ** .7)
    if sec == 'full' and beat in (1, 3): add(drums, clap(), t, .32, .05)
    if sec == 'full': add(drums, hat(), t + B / 2, .09, .3); add(drums, hat(), t + B * .75, .04, -.3)
    if sec == 'full' and beat == 3 and (i // 4) % 2 == 1: add(drums, hat(True), t + B / 2, .07, .3)
    for h in (0, .5):                                      # pumping eighth-note bass
        add(bass, bassn(root if h == 0 else root, B / 2 * .9), t + h * B, .32 if sec == 'full' else .22, 0)
    if beat in (0, 1, 2, 3): add(keys, stab(ch), t + B / 2, .16 if sec == 'full' else .1, -.2 + .4 * (beat % 2))
# the hook: a square-wave lead (the mascot's voice), repeating every two bars
for i in range(int(END / (2 * BAR)) + 1):
    t0 = i * 2 * BAR
    for k, n, ln in HOOK:
        t = t0 + k * B / 2
        if section(t) != 'full' or t >= END: continue
        add(lead, pulse(hz(n), ln * B / 2 * .92, duty=.25, rel=.03), t, .2, .12)
        add(lead, pulse(hz(n) * 1.004, ln * B / 2 * .92, duty=.5, rel=.03), t + .012, .08, -.25)     # a detuned double: width
# fills before chapters, impacts on the drops, risers into them
for tf in (22.2, 26.7):
    for j in range(4): add(drums, clap(), tf - B + j * B / 4, .18 + .06 * j, 0)
for ti in (0.0, 18.2, DROP[1], 41.6, END): add(drums, impact(), ti, .45, 0)
for t0, t1 in ((16.2, 18.2), (40.4, 41.6)): add(drums, riser(t1 - t0), t0, .12, 0)
filt = np.ones(N, np.float32); a0, a1 = int(7.2 * SR), int(18.2 * SR); filt[a0:a1] = 0     # problem section: low-passed band
band = (bass + keys) * pump[:, None]
lowb = np.stack([lp(band[:, 0], 700), lp(band[:, 1], 700)], 1).astype(np.float32)
band = band * filt[:, None] + lowb * (1 - filt[:, None])
fin = np.zeros((N, 2), np.float32)
for n in ['A2', 'A3', 'C4', 'E4', 'A4']: add(fin, (saw(hz(n), 3.0, 10) * np.exp(-tt(3.0) / 1.0)).astype(np.float32), END, .05, 0)
music = drums + band + fin
music = S.room(music, size=.25, mix=.08)
mus_lead = S.room(lead, size=.3, mix=.12)

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
mg = db(-5.6) * (1 - duck * (1 - db(-10)))
mix = vo * 1.0 + (music + mus_lead + chip * .9) * mg[:, None] + fx + room[:, None]
mix = limit(mix, .95)[:int(DUR * SR)]
fade = np.ones(len(mix)); fade[-int(.5 * SR):] = np.linspace(1, 0, int(.5 * SR)); mix *= fade[:, None]
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'out', 'mix.wav')
sf.write(out, mix.astype(np.float32), SR)
# report the balance: voice vs music RMS while the voice speaks
m = venv[:len(mix)] > .01
vr = np.sqrt((vo[:len(mix)][m] ** 2).mean()); mr = np.sqrt((((music + mus_lead + chip) * mg[:, None])[:len(mix)][m] ** 2).mean())
print(f'mix {out} {len(mix) / SR:.2f}s  voice over music: {20 * np.log10(vr / mr):.1f} dB')
