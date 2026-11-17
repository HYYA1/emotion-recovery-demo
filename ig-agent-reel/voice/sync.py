"""음성 배치 + 자막 타이밍 맞추기.
사용법 (ig-agent-reel 폴더에서):  python3 voice/sync.py
- 각 장면의 음성(v01~v17)을 장면 시작 0.12초 뒤에 놓되, 앞 음성이 끝나기 전이면 0.1초 뒤로 미룸 → voice/schedule.json
- src/captions.ts 의 자막 문구(어절 묶음)는 그대로 두고, 시작·끝 시간만 실제 말하는 순간에 맞춰 다시 씀
  (받아쓰기 결과 voice/words.json 의 단어 시간 사용)
자막 문구를 고친 뒤 이 스크립트를 다시 돌리면 시간도 다시 맞춰집니다.
"""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = os.path.join(ROOT, 'voice')
tl = open(os.path.join(ROOT, 'src/timeline.ts'), encoding='utf-8').read()
scenes = [(int(a), float(b), float(c)) for a, b, c in re.findall(r"\{ id: (\d+), start: ([\d.]+), end: ([\d.]+)", tl)]
dur = json.load(open(os.path.join(V, 'dur.json')))
words = json.load(open(os.path.join(V, 'words.json'), encoding='utf-8'))
LEAD, GAP = 0.12, 0.10

# 1) 음성 배치
sched, prev_end = {}, 0.0
for sid, s0, s1 in scenes:
    vid = f'v{sid:02d}'
    t = max(s0 + LEAD, prev_end + GAP)
    sched[vid] = round(t, 3)
    prev_end = t + dur[vid]
json.dump(sched, open(os.path.join(V, 'schedule.json'), 'w'), indent=1)

# 2) 자막: captions.ts 의 문구를 장면별로 읽음
cap_src = open(os.path.join(ROOT, 'src/captions.ts'), encoding='utf-8').read()
def scene_of(t):
    for sid, s0, s1 in scenes:
        if s0 <= t + 1e-6 < s1: return sid
    return scenes[-1][0]

# 장면 구분은 "// [n]" 주석을 따름 (없으면 시작 시간으로 판단)
by_scene, cur = {}, None
for line in cap_src.splitlines():
    m = re.search(r"//\s*\[(\d+)\]", line)
    if m: cur = int(m.group(1)); continue
    m = re.search(r"\{ start: ([\d.]+), end: [\d.]+, text: (\"[^\"]*\"|'[^']*') \}", line)
    if m: by_scene.setdefault(cur if cur else scene_of(float(m.group(1))), []).append(m.group(2)[1:-1])

def char_time(vid, frac):
    """줄 안의 글자 위치(0~1) → 음성 안의 시간(초). 받아쓰기 단어 시간을 글자 수로 나눠 보간."""
    W = [(len(re.sub(r'\W', '', w)), max(0.0, a), b) for w, a, b in words[vid]]
    total = sum(n for n, _, _ in W) or 1
    target, acc = frac * total, 0
    for n, a, b in W:
        if acc + n >= target and n:
            return a + (b - a) * (target - acc) / n
        acc += n
    return W[-1][2] if W else 0.0

out = []
for sid, s0, s1 in scenes:
    vid, chunks = f'v{sid:02d}', by_scene.get(sid, [])
    full = ''.join(re.sub(r'\W', '', c) for c in chunks) or 'x'
    acc = 0
    for i, c in enumerate(chunks):
        st = sched[vid] + (0 if i == 0 else char_time(vid, acc / len(full)))
        out.append([round(max(st, s0 if i == 0 else 0), 3), c, sid])
        acc += len(re.sub(r'\W', '', c))
# 너무 짧게 스쳐 가지 않도록 자막마다 최소 MIN_SHOW 초 보이게 다음 자막 시작을 살짝 미룸
MIN_SHOW = 0.4
for i in range(1, len(out)):
    if out[i][0] - out[i - 1][0] < MIN_SHOW: out[i][0] = round(out[i - 1][0] + MIN_SHOW, 3)
# 끝 시간 = 다음 자막 시작 (마지막은 영상 끝)
end_all = scenes[-1][2]
lines = []
for i, (st, c, sid) in enumerate(out):
    en = out[i + 1][0] if i + 1 < len(out) else end_all
    lines.append((sid, st, en, c))

head = cap_src.split('export const CAPTIONS')[0]
head = re.sub(r"// start/end는.*\n", "// start/end는 영상 전체 기준 초. voice/sync.py 가 실제 음성에 맞춰 시간을 다시 씁니다(문구만 고치고 sync.py 를 돌리세요).\n", head)
body, last = [], None
for sid, st, en, c in lines:
    if sid != last: body.append(f'  // [{sid}]'); last = sid
    q = "'" if "'" not in c else '"'
    body.append(f'  {{ start: {st:.3f}, end: {en:.3f}, text: {q}{c}{q} }},')
open(os.path.join(ROOT, 'src/captions.ts'), 'w', encoding='utf-8').write(head + 'export const CAPTIONS: Caption[] = [\n' + '\n'.join(body) + '\n];\n')
print('schedule', sched)
print('captions', len(lines))
