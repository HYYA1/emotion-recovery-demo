"""한국어 내레이션 생성 (Supertonic-3, 이 컴퓨터 안에서 실행되는 오프라인 음성 모델).
사용법 (grandson-ai 폴더에서):  voice/.venv/bin/python voice/gen.py [목소리=M1] [속도=0.92] [다시 만들 줄: v07,v11]
lines.json 의 각 줄 → voice/<id>.wav + voice/dur.json (앞뒤 무음은 잘라냄)
"say" 가 있으면 그 글자를 읽습니다 (예: 챗GPT → 챗지피티). 자막은 text 를 씁니다.
"""
import json, os, sys
import numpy as np, soundfile as sf
from supertonic import TTS

HERE = os.path.dirname(os.path.abspath(__file__))
VOICE = sys.argv[1] if len(sys.argv) > 1 else 'M1'
SPEED = float(sys.argv[2]) if len(sys.argv) > 2 else 0.92
ONLY = set(sys.argv[3].split(',')) if len(sys.argv) > 3 else None   # 일부 줄만 다시 만들기: v07,v11

tts = TTS(model='supertonic-3')
style = tts.get_voice_style(VOICE)
lines = json.load(open(os.path.join(HERE, 'lines.json'), encoding='utf-8'))
dur = json.load(open(os.path.join(HERE, 'dur.json'))) if ONLY and os.path.exists(os.path.join(HERE, 'dur.json')) else {}
for L in lines:
    if ONLY and L['id'] not in ONLY: continue
    speed = L.get('speed', SPEED)
    wav, _ = tts.synthesize(L.get('say', L['text']), voice_style=style, lang='ko', speed=speed, total_steps=24)
    y = np.asarray(wav, dtype=np.float32).reshape(-1)
    sr = tts.sample_rate
    nz = np.flatnonzero(np.abs(y) > 0.01 * np.abs(y).max())
    if len(nz): y = y[max(0, nz[0] - int(.03 * sr)): nz[-1] + int(.10 * sr)]
    sf.write(os.path.join(HERE, f"{L['id']}.wav"), y, sr)
    dur[L['id']] = round(len(y) / sr, 3)
    print(L['id'], dur[L['id']], L['text'])
json.dump(dur, open(os.path.join(HERE, 'dur.json'), 'w'), indent=1)
