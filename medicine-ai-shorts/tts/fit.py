"""Write lines.json with a rate per line, so that every line fits its slot in the picture's timeline.
python fit.py <LIB>  (regenerates voices/ until each line fits; prints durations)"""
import json, os, subprocess, sys
LIB = sys.argv[1]; HERE = os.path.dirname(os.path.abspath(__file__)); P = os.path.dirname(HERE)
V = 'ko-KR-HyunsuMultilingualNeural'
LINES = [
 ('v01', '약 봉투 글씨, 보이세요?', None, 2.4),
 ('v02', '이제 돋보기 필요 없어요. 휴대폰이 대신 읽어 줘요!', None, 4.35),
 ('v03', '약 봉투가 여러 개면, 아침 약인지 저녁 약인지 헷갈리잖아요.', None, 4.45),
 ('v04', '자식한테 매번 묻기도 미안하고요.', None, 2.55),
 ('v05', '이제는요, 글자 칠 필요 없이 말로 물어보세요.', None, 3.65),
 ('v06', '먼저 챗GPT나 제미나이 같은 AI 앱을 열어 주세요.', '먼저 챗지피티나 제미나이 같은 에이아이 앱을 열어 주세요.', 3.75),
 ('v07', '카메라 누르고, 약 봉투를 꽉 차게, 찰칵!', None, 3.85),
 ('v08', '그다음 마이크 누르고, 말하듯이 물어보세요.', None, 3.35),
 ('v09', '그러면 이렇게 크고 쉬운 말로 딱 알려 줘요.', None, 3.05),
 ('v10', '궁금한 건 또 물어보세요. 몇 번을 물어봐도 괜찮아요.', None, 5.2),
 ('v11', '앱을 열고, 찰칵 찍고, 마이크로 물어보면 끝! 진짜 쉽죠?', None, 5.8),
 ('v12', '내일 병원 가시면 꼭 한번 써 보세요. 충분히 하실 수 있어요!', None, 5.25),
 ('v13', '구독하시면 이런 꿀팁 계속 알려 드릴게요. 부모님께도 꼭 보내 드리세요!', None, 6.4),
]
Q = {'id': 'q01', 'text': '이 약 어떻게 먹어?', 'voice': 'ko-KR-SunHiNeural', 'rate': '-12%', 'pitch': '-14Hz'}
old = {l['id']: l for l in json.load(open(os.path.join(HERE, 'lines.json')))} if os.path.exists(os.path.join(HERE, 'lines.json')) else {}
rate = {i: 4 for i, *_ in LINES}
for it in range(6):
    out = []
    for i, text, say, slot in LINES:
        L = {'id': i, 'text': text, 'voice': V, 'rate': f'{rate[i]:+d}%'}
        if say: L['say'] = say
        if i in old and old[i].get('text') == text and 'asr' in old[i]: L['asr'] = old[i]['asr']
        out.append(L)
    out.insert(8, Q)
    json.dump(out, open(os.path.join(HERE, 'lines.json'), 'w'), ensure_ascii=False, indent=1)
    subprocess.run([os.path.join(LIB, '.venv/bin/python'), os.path.join(HERE, 'run_tts.py'), os.path.join(LIB, 'core/tts/tts_zh.py'), os.path.join(HERE, 'lines.json'), os.path.join(P, 'voices')], check=True, stdout=subprocess.DEVNULL)
    D = json.load(open(os.path.join(P, 'voices', 'dur.json')))
    over = [(i, D[i], slot) for i, _, _, slot in LINES if D[i] > slot]
    print('pass', it, {i: round(D[i], 2) for i in D}, 'over:', over)
    if not over: break
    for i, d, slot in over: rate[i] += max(3, int((d / slot - 1) * 100) + 2)
