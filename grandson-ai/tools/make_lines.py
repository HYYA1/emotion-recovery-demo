"""SCRIPT.md 의 대본(> 로 시작하는 줄)을 문장 단위로 나눠 voice/lines.json 을 만듭니다.
사용법 (grandson-ai 폴더에서):  python3 tools/make_lines.py
- text: 자막에 보일 글자 (영어 이름은 그대로)
- say : 음성이 읽을 글자 (영어 이름을 한국어 발음으로 바꾸고, ** 와 [사실] 표시는 뺌)
대본을 고친 뒤 이 스크립트를 다시 돌리면 됩니다.
"""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, 'SCRIPT.md'), encoding='utf-8').read()
SAY = [('"ChatGPT"', '챗지피티'), ('"Gemini"', '제미나이'), ('"OpenAI"', '오픈에이아이'), ('"Google"', '구글'),
       ('ChatGPT', '챗지피티'), ('Gemini', '제미나이'), ('OpenAI', '오픈에이아이'), ('Google', '구글'),
       ('챗GPT', '챗지피티'), ('오픈AI', '오픈에이아이'), ('더하기(+)', '더하기'), ('(+)', '')]
# 영어 철자를 그대로 읽기 어색한 문장은 읽는 말만 따로 정함 (자막은 대본 그대로)
SAY_OVERRIDE = {'s04_07': '챗지피티는, 오픈에이아이. 제미나이는, 구글. 이렇게 쓰여 있는 걸 까세요.',
                's04_04': '검색창에 챗지피티는 영어로 챗지피티, 제미나이도 영어로 제미나이라고 쓰시면 돼요.'}

lines, scene = [], None
for raw in src.splitlines():
    m = re.match(r'### scene(\d+)', raw)
    if m: scene = int(m.group(1)); continue
    if scene is None or not raw.startswith('>'): continue
    text = raw[1:].strip().replace('**', '').replace('[사실]', '').strip()
    if not text: continue
    # 한 줄에 문장이 여러 개면 나눔 (따옴표 안의 문장부호는 그대로)
    parts = re.findall(r'(?:"[^"]*"|[^.?!"])+[.?!]*', text)
    parts = [p.strip() for p in parts if p.strip()]
    for p in parts:
        say = p
        for a, b in SAY: say = say.replace(a, b)
        n = sum(1 for l in lines if l['scene'] == scene) + 1
        lid = f's{scene:02d}_{n:02d}'
        lines.append({'id': lid, 'scene': scene, 'text': p, 'say': SAY_OVERRIDE.get(lid, say.replace('"', ''))})
json.dump(lines, open(os.path.join(ROOT, 'voice', 'lines.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(lines), 'lines')
for l in lines: print(l['id'], l['text'], '|', l['say'] if l['say'] != l['text'] else '')
