"""Score + foley + ambience for 우리 동네 빵집의 하루 -> out/mix.wav
Run from the library root:  $LIB/.venv/bin/python <project>/mix.py
Reads <project>/events.json (exported from the page by core/render/events.mjs)."""
import sys, os, json
import numpy as np, soundfile as sf
LIB = os.environ.get('LIB', os.getcwd()); sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio.sfx import SR, add, limit, noise, bp, lp, hp, t_, env_exp, norm, brown, compress

HERE = os.path.dirname(os.path.abspath(__file__))
ev = json.load(open(os.path.join(HERE, 'events.json')))
DUR = ev['dur']; EV = ev['ev']
N = int(DUR * SR) + SR
rng = np.random.default_rng(7)
S.seed(7)
BEAT = 60 / 96; BAR = BEAT * 4

def env_ad(n, a, r):           # attack / release in samples, flat between
    e = np.ones(n); a = max(1, a); r = max(1, r)
    e[:a] = np.linspace(0, 1, a); e[-r:] *= np.linspace(1, 0, r); return e
def gate(x, t0, t1, fi=.5, fo=.5):   # keep x only between t0 and t1, with fades
    tt = np.arange(len(x)) / SR
    g = np.clip((tt - t0) / fi, 0, 1) * np.clip((t1 - tt) / fo, 0, 1)
    return x * g[:, None] if x.ndim == 2 else x * g

# ---------------- ambience ----------------
amb = np.zeros((N, 2))
room = lp(brown(N / SR), 400); room = norm(room) * .05
amb[:, 0] += room; amb[:, 1] += np.roll(room, 2400)
hum_t = np.arange(N) / SR
hum = (np.sin(2 * np.pi * 98 * hum_t) * .5 + np.sin(2 * np.pi * 196 * hum_t) * .2) * .025 + lp(noise(N / SR), 250) * .02
hum = gate(hum, 2.6, 9.2, 1.2, 1.5)               # the oven, before dawn
amb[:, 0] += hum * .9; amb[:, 1] += hum * 1.1
street = bp(brown(N / SR), 200, 1600); street = norm(street) * .07
street = gate(street, 9.6, 23.5, 1.0, 2.0)       # the street wakes up
amb[:, 0] += street; amb[:, 1] += np.roll(street, 3000)
def chirp_bird(f0):
    d = .09; tt = t_(d); f = f0 * (1 + .25 * np.sin(np.pi * tt / d))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / d) ** 2
for t in [10.4, 10.55, 11.9, 12.05, 13.6, 15.2, 15.35, 17.1, 18.4, 18.55, 20.3]:   # morning birds
    for k in range(rng.integers(2, 4)): add(amb, chirp_bird(rng.uniform(3200, 4300)), t + k * .11, .05, rng.uniform(-.8, .8))
def cricket():
    d = .25; tt = t_(d)
    return np.sin(2 * np.pi * 4600 * tt) * (np.sin(2 * np.pi * 30 * tt) > .2) * np.sin(np.pi * tt / d)
for t in np.arange(22.6, DUR, .62):              # crickets, night
    g = .035 * min(1, (t - 22.6) / 1.5) * (1 - .6 * max(0, (t - 27.5) / 2.5))
    add(amb, cricket(), t + rng.uniform(0, .1), g, -.6); add(amb, cricket(), t + .31 + rng.uniform(0, .1), g * .8, .6)

# ---------------- foley ----------------
fx = np.zeros((N, 2))
def rustle(d):                 # paper-brush rustle: band-passed noise, light tremolo
    tt = t_(d); x = bp(noise(d), 1200, 6000) * (.7 + .3 * np.sin(2 * np.pi * 9 * tt + rng.uniform(0, 6)))
    return norm(x * np.sin(np.pi * np.clip(tt / d, 0, 1)) ** .7)
def scratch(d=.55):            # pencil on paper
    tt = t_(d); grain = (rng.random(len(tt)) < .25).astype(float)
    x = hp(noise(d), 2500) * (.4 + .6 * lp(grain, 60)) * np.sin(np.pi * tt / d) ** .5
    return norm(x)
def plip():                    # a wet drop of pigment
    d = .5; tt = t_(d); f = 700 * np.exp(-tt * 9) + 240
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(d, .09) + lp(noise(d), 900) * env_exp(d, .03) * .3)
def shop_bell():               # a small brass door bell, struck three times as the door swings
    d = 2.2; out = np.zeros(int(d * SR))
    for k, (dt, v) in enumerate([(0, 1), (.13, .6), (.29, .35)]):
        tt = t_(d - dt)
        x = sum(a * np.sin(2 * np.pi * f * (1 + .002 * k) * tt) * np.exp(-tt / tau) for f, a, tau in [(2093, 1, .7), (3310, .55, .45), (4880, .3, .25), (6400, .15, .12)])
        s = int(dt * SR); n = min(len(x), len(out) - s); out[s:s + n] += x[:n] * v
    return norm(out)
def bag():                     # a paper bag crumple
    d = .32; tt = t_(d); bursts = (rng.random(len(tt)) < .04).astype(float)
    return norm(bp(noise(d), 800, 5000) * lp(bursts, 40) * np.exp(-tt / .15))
def soft_step(v):
    d = .14; tt = t_(d)
    return norm(lp(noise(d), 500) * env_exp(d, .025) + np.sin(2 * np.pi * 90 * tt) * env_exp(d, .03) * .5) * v
def click():
    d = .05; tt = t_(d); return norm(bp(noise(d), 1500, 5000) * env_exp(d, .004))
for e in EV:
    t, ty, pan = e['t'], e['type'], e.get('pan', 0)
    if ty == 'bloom': add(fx, plip(), t, .35, 0)
    elif ty == 'rustle': x = rustle(e['d']); add(fx, x, t, .16, pan)
    elif ty == 'scratch': add(fx, scratch(), t + .3, .07, pan)
    elif ty == 'title': add(fx, rustle(1.0), t, .08, 0)
    elif ty == 'lift': add(fx, rustle(.25), t, .1, 0)
    elif ty == 'bell': add(fx, shop_bell(), t, .32, pan)
    elif ty == 'burst': add(fx, rustle(.9), t, .26, 0); add(fx, rustle(.7), t + .1, .18, -.4); add(fx, rustle(.7), t + .15, .18, .4)
    elif ty == 'sold': add(fx, bag(), t, .16, pan)
    elif ty == 'lamp': add(fx, click(), t, .25, pan)
    elif ty == 'mist': add(fx, rustle(e['d']), t, .1, 0)
    elif ty == 'step': add(fx, soft_step(e.get('v', 1)), t, .05, pan * .8)

# ---------------- score: F major, 96 BPM, 12 bars ----------------
def b(bar, beat=0): return (bar - 1) * BAR + beat * BEAT   # bar 1 starts at 0
sc = []
# bars 1-3 (pre-dawn): sparse kalimba arpeggio over a soft pad
for bar, ch in [(1, ['F3', 'A3', 'C4', 'E4']), (2, ['D4', 'F4', 'A3', 'C4']), (3, ['A#3', 'D4', 'F4', 'A4'])]:
    for i, p in enumerate(ch): sc.append((b(bar, i), 'kalimba', p, 1.5, .45 + .1 * (i == 0), -.3 + .2 * i))
sc.append((b(3, 3.5), 'kalimba', 'C5', 1.2, .35, .3))
# bar 4: silence (the brush lifted). Bar 5: after the bell, the melody
mel = [(5, 0.5, 'A4'), (5, 1, 'C5'), (5, 2, 'A4'), (5, 3, 'G4'),
       (6, 0, 'F4'), (6, 1.5, 'A4'), (6, 2, 'C5'), (6, 3, 'D5'),
       (7, 0, 'C5'), (7, 1, 'A4'), (7, 2, 'A#4'), (7, 3, 'A4'),
       (8, 0, 'G4'), (8, 1, 'A4'), (8, 2, 'C5'), (8, 3, 'E4'),
       (9, 0, 'F4'), (9, 1, 'A4'), (9, 2, 'D5'), (9, 3, 'C5')]
for bar, bt, p in mel: sc.append((b(bar, bt), 'kalimba', p, 1.0, .62, .1))
# guitar: bass note + broken chord on eighths, bars 5-9
prog = {5: ('F2', ['F3', 'A3', 'C4']), 6: ('A2', ['E3', 'A3', 'C4']), 7: ('A#2', ['F3', 'A#3', 'D4']), 8: ('C3', ['E3', 'G3', 'C4']), 9: ('D3', ['F3', 'A3', 'D4'])}
for bar, (bass, ch) in prog.items():
    sc.append((b(bar, 0), 'guitar_nylon', bass, 2.4, .6, -.15))
    sc.append((b(bar, 2), 'guitar_nylon', bass, 1.2, .45, -.15))
    for i in range(8):
        if bar == 5 and i < 1: continue
        sc.append((b(bar, .5 * i + .5) if i < 7 else b(bar, 3.5), 'guitar_nylon', ch[i % 3], .6, .32 + .08 * (bar >= 7), .25))
# burst: glockenspiel chord on bar 6 beat 1
for i, p in enumerate(['F5' if False else 'A5', 'C6', 'F6']): sc.append((b(6, 0) + i * .02, 'glockenspiel', p, 2.0, .55, .2))
# a loaf sold = one glockenspiel note, rising
sold = sorted(e['t'] for e in EV if e['type'] == 'sold')
for i, t in enumerate(sold):
    p = ['C6', 'D6', 'F6', 'G6', 'A6', 'C7', 'A6', 'G6', 'F6'][i % 9]
    sc.append((t, 'glockenspiel', p, 1.2, .38, (i % 2) * .6 - .3))
# bar 10 (dusk): harp, slowing, then out
for i, (dt, p) in enumerate([(0, 'A#2'), (.7, 'F3'), (1.5, 'A3'), (2.4, 'D4')]): sc.append((b(10) + dt, 'harp', p, 2.0, .45, -.2 + .1 * i))
# bar 11: one kalimba note after the second silence, then the final chord, ringing to the end
sc.append((25.0, 'kalimba', 'A4', 2.0, .5, 0))
for i, p in enumerate(['F2', 'C3', 'A3', 'E4', 'G4']): sc.append((26.25 + i * .07, 'guitar_nylon', p, 3.8, .45, -.2 + .1 * i))
sc.append((26.25, 'harp', 'C5', 3.5, .4, .25)); sc.append((26.6, 'glockenspiel', 'A6', 3.0, .3, .3))
mus = S.render(sc, dur=N / SR)

# a soft pad (synthesised): bars 1-3 and the dusk bar, never below MIDI 48
def pad(notes, t0, t1):
    d = t1 - t0; tt = t_(d); x = np.zeros_like(tt)
    for m in notes:
        f = 440 * 2 ** ((m - 69) / 12)
        for det in (-.004, .004): x += np.sin(2 * np.pi * f * (1 + det) * tt) + .25 * np.sin(4 * np.pi * f * (1 + det) * tt)
    x = lp(x, 1400) * env_ad(len(tt), int(.9 * SR), int(1.0 * SR))
    return norm(x)
P = np.zeros((N, 2))
add(P, pad([53, 57, 60, 64], 0, 2.6), 0.0, .07, -.2); add(P, pad([50, 57, 60, 65], 2.4, 5.1), 2.4, .07, .2)
add(P, pad([58, 62, 65, 69], 4.9, 7.6), 4.9, .07, 0)                    # out by bar 4 (silence 1)
add(P, pad([58, 62, 65, 69], 22.5, 24.4), 22.5, .06, 0)                # dusk, out before silence 2
mus = mus[:N] + P
mus = gate(mus, 0, 7.75, .01, .35) + gate(mus, 9.95, 24.45, .02, .5) + gate(mus, 24.9, DUR + 1, .02, .5)   # the two silences
mus = S.room(mus, size=.42, mix=.2)

# ---------------- mix ----------------
mix = mus * .9 + fx * 1.0 + amb * 1.0
mix = limit(mix, .9)
mix = mix[:int(DUR * SR)]
fade = np.ones(len(mix)); fade[-int(.6 * SR):] = np.linspace(1, 0, int(.6 * SR)) ** 1.5
mix *= fade[:, None]
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'out', 'mix.wav')
sf.write(out, mix.astype(np.float32), SR)
print('mix', out, f'{len(mix) / SR:.2f}s')
