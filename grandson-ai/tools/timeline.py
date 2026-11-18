"""음성 길이로 영상 시간표를 만듭니다 → src/timeline.json
사용법 (grandson-ai 폴더에서):  python3 tools/timeline.py   (lib 의 python 이나 voice/.venv 의 python, numpy·soundfile 필요)
- 문장 사이 GAP초, 장면 앞 INTRO초, 장면 뒤 OUTRO초 쉼
- EXTRA: 화면에서 보여 줄 게 있는 문장 뒤에 더 쉬는 시간
- mouth: 30fps 마다 목소리 크기(0~1) → 손주 캐릭터 입 모양
"""
import json, os
import numpy as np, soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = os.path.join(ROOT, 'voice')
FPS = 30
GAP, INTRO, OUTRO = 0.55, 0.7, 0.9
FIRST_INTRO = 1.6          # 영상 맨 처음: 제목이 먼저 뜨고 인사
END_HOLD = 3.0             # 마지막 인사 뒤 구독 화면
EXTRA = {'s02_03': .8, 's03_01': .4, 's04_03': .8, 's04_04': 1.4, 's04_07': .6, 's05_03': .8, 's05_04': .6,
         's06_02': .4, 's06_04': 1.0, 's06_05': .6, 's06_06': 2.2, 's06_08': .8, 's07_02': .8, 's08_02': .8,
         's08_03': 1.6, 's09_02': .6, 's09_04': .6, 's09_06': .6, 's10_02': .8}

lines = json.load(open(os.path.join(V, 'lines.json'), encoding='utf-8'))
dur = json.load(open(os.path.join(V, 'dur.json')))
scenes, t = [], 0.0
for sid in sorted({l['scene'] for l in lines}):
    s0 = t
    t += FIRST_INTRO if sid == 1 else INTRO
    L = []
    for l in [x for x in lines if x['scene'] == sid]:
        L.append({'id': l['id'], 'start': round(t, 3), 'dur': dur[l['id']], 'text': l['text']})
        t += dur[l['id']] + EXTRA.get(l['id'], 0) + GAP
    t += OUTRO - GAP
    if sid == max(x['scene'] for x in lines): t += END_HOLD
    scenes.append({'id': sid, 'start': round(s0, 3), 'end': round(t, 3), 'lines': L})
DUR = round(t, 3)

# 입 모양: 목소리 크기 (30fps)
N = int(np.ceil(DUR * FPS)); mouth = np.zeros(N)
for sc in scenes:
    for l in sc['lines']:
        y, sr = sf.read(os.path.join(V, l['id'] + '.wav'), dtype='float32')
        if y.ndim > 1: y = y.mean(1)
        hop = sr // FPS
        for k in range(len(y) // hop):
            f = int(round(l['start'] * FPS)) + k
            if f < N: mouth[f] = max(mouth[f], float(np.sqrt(np.mean(y[k * hop:(k + 1) * hop] ** 2))))
mouth = np.clip(mouth / (np.percentile(mouth[mouth > 0], 95) + 1e-9), 0, 1)
mouth = np.convolve(mouth, [.25, .5, .25], 'same')
out = {'fps': FPS, 'dur': DUR, 'scenes': scenes, 'mouth': [round(float(m), 2) for m in mouth]}
json.dump(out, open(os.path.join(ROOT, 'src', 'timeline.json'), 'w', encoding='utf-8'), ensure_ascii=False)
for sc in scenes: print(f"scene{sc['id']:02d} {sc['start']:6.1f}–{sc['end']:6.1f}  ({sc['end']-sc['start']:.1f}s, {len(sc['lines'])} lines)")
print(f'total {DUR:.1f}s = {int(DUR//60)}분 {DUR%60:.0f}초')
