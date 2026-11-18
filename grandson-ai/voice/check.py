"""음성 받아쓰기 검사 (faster-whisper small). 대본과 비교해 틀린 줄의 id 를 출력합니다.
사용법:  <라이브러리>/.venv/bin/python voice/check.py   → 마지막 줄 BAD=s07_03,s09_06 (없으면 BAD=)
받아쓰기 모델의 표기 습관(에이아이→AI, 제미나이→재미나이 등)은 같은 말로 봅니다.
"""
import difflib, json, os, re, sys
from faster_whisper import WhisperModel

HERE = os.path.dirname(os.path.abspath(__file__))
ALIAS = [('AI', '에이아이'), ('ai', '에이아이'), ('재미나이', '제미나이'), ('GPT', '지피티'), ('PT', '피티'),
         ('쳇', '챗'), ('채찌', '챗지'), ('챗GPT', '챗지피티'), ('구굴', '구글')]
def norm(s):
    for a, b in ALIAS: s = s.replace(a, b)
    s = re.sub(r'[^0-9A-Za-z가-힣]', '', s)
    return s

lines = json.load(open(os.path.join(HERE, 'lines.json'), encoding='utf-8'))
only = set(sys.argv[1].split(',')) if len(sys.argv) > 1 and sys.argv[1] else None
md = WhisperModel('small', device='cpu', compute_type='int8')
bad = []
for L in lines:
    if only and L['id'] not in only: continue
    segs, _ = md.transcribe(os.path.join(HERE, f"{L['id']}.wav"), language='ko', beam_size=5)
    heard = ''.join(s.text for s in segs).strip()
    ref = L['say']
    r = difflib.SequenceMatcher(None, norm(ref), norm(heard)).ratio()
    ok = r >= 0.9
    if not ok: bad.append(L['id'])
    print(('OK  ' if ok else 'BAD ') + f"{L['id']} {r:.2f} | {ref} → {heard}", flush=True)
print('BAD=' + ','.join(bad))
