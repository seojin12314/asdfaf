# 고정 대사 음성 생성(일레븐랩스). 키는 리포 루트 .env의 ELEVENLABS_API_KEY만 읽는다(커밋 금지).
# 사용: python tools/gen_voices.py [캐릭터id ...]   (기본: work/voice-lines.json의 모든 캐릭터)
# 출력: mvp/saju/assets/voice/<id>/<key>.mp3 + mvp/saju/assets/voice/manifest.json ({id: {대사: 파일}})
import json, os, sys, time, urllib.request, urllib.error
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API = 'https://api.elevenlabs.io/v1'
# 공유 라이브러리 음성(한국어): public_owner_id, voice_id, 음성 설정
VOICES = {
    'flame':     dict(owner='200ec45126f4cadc6d33efdcb52ebce16b49b665b3c11463845eb9a0103a6818', vid='8jHHF8rMqMlg8if2mOUe', name='Han',      stability=.40, similarity=.80, style=.45),
    'sage':      dict(owner='219e2c24fb2ce1f2a9727325609ced8e5548e2320fdd30d5f0e774c19e0604f8', vid='PLfpgtLkFW07fDYbUiRJ', name='Bongpal',  stability=.50, similarity=.80, style=.30),
    'granny':    dict(owner='f8a94cb0672ec5ee8b0ad41d0d7d9fd0958c68ad07945ac6ddd4dc679c940789', vid='ZjAPD4f11zlnEnZpKDgo', name='Haemi',    stability=.55, similarity=.80, style=.25),
    'child':     dict(owner='65840620a5034dadd45758765d9ca7aff3a8501956d5305cc081096fc0120eb7', vid='O2KReOFLpoR65nz6C9Se', name='Aria',     stability=.40, similarity=.80, style=.50),
    'hunter':    dict(owner='97504c820ad9b5b352d4b9a781d7837f0d7e2cb21587982c8fc33c6f0d75cb8c', vid='0oqpliV6dVSr9XomngOW', name='Jini',     stability=.70, similarity=.80, style=.10),
    'mbti':      dict(owner='0183dfc45a8c273b5ffa12e900b87c14bcb2bce6b9d0328fe2b49f9ef58742b0', vid='pb3lVZVjdFWbkhPKlelB', name='HarryKim', stability=.55, similarity=.80, style=.25),
}
# 발음: 영문 약어는 한글로(메모리 규칙: 일레븐랩스엔 한글 발음)
PRON = [('MBTI', '엠비티아이'), ('MVP', '엠브이피'), ('K-천문명리학', '케이 천문명리학')]

def key():
    env = os.path.join(ROOT, '.env')
    for line in open(env, encoding='utf-8'):
        if line.startswith('ELEVENLABS_API_KEY='): return line.split('=', 1)[1].strip()
    raise SystemExit('.env에 ELEVENLABS_API_KEY 없음')
K = key()

def req(method, path, body=None, raw=False):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(API + path, data=data, method=method, headers={'xi-api-key': K, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' if raw else 'application/json'})
    try:
        with urllib.request.urlopen(r, timeout=120) as h: return h.read() if raw else json.loads(h.read() or b'{}')
    except urllib.error.HTTPError as e:
        msg = e.read().decode('utf-8', 'replace')[:400]; raise RuntimeError(f'{method} {path} -> {e.code} {msg}')

def my_voices():
    return {v['voice_id']: v['name'] for v in req('GET', '/voices').get('voices', [])}

def ensure_voice(cfg):
    have = my_voices()
    if cfg['vid'] in have: return cfg['vid']
    try:
        res = req('POST', f"/voices/add/{cfg['owner']}/{cfg['vid']}", {'new_name': 'saju-' + cfg['name']})
        return res.get('voice_id', cfg['vid'])
    except RuntimeError as e:
        if 'limit' in str(e).lower() or 'slot' in str(e).lower():
            # 슬롯이 꽉 찼으면 내가 추가한(saju-) 음성을 지우고 재시도
            for vid, name in my_voices().items():
                if name.startswith('saju-'): req('DELETE', f'/voices/{vid}')
            res = req('POST', f"/voices/add/{cfg['owner']}/{cfg['vid']}", {'new_name': 'saju-' + cfg['name']})
            return res.get('voice_id', cfg['vid'])
        raise

def tts(vid, cfg, text):
    for a, b in PRON: text = text.replace(a, b)
    body = {'text': text, 'model_id': 'eleven_multilingual_v2', 'voice_settings': {'stability': cfg['stability'], 'similarity_boost': cfg['similarity'], 'style': cfg['style'], 'use_speaker_boost': True}}
    return req('POST', f'/text-to-speech/{vid}?output_format=mp3_44100_64', body, raw=True)

def main():
    lines = json.load(open(os.path.join(ROOT, 'work', 'voice-lines.json'), encoding='utf-8'))
    ids = sys.argv[1:] or sorted({l['id'] for l in lines})
    out_root = os.path.join(ROOT, 'mvp', 'saju', 'assets', 'voice')
    mpath = os.path.join(out_root, 'manifest.json')
    manifest = json.load(open(mpath, encoding='utf-8')) if os.path.exists(mpath) else {}
    for cid in ids:
        cfg = VOICES[cid]; os.makedirs(os.path.join(out_root, cid), exist_ok=True)
        vid = ensure_voice(cfg); print(f'[{cid}] voice {cfg["name"]} ready', flush=True)
        manifest.setdefault(cid, {})
        mine = [l for l in lines if l['id'] == cid]
        for i, l in enumerate(mine):
            fn = l['key'] + '.mp3'; fp = os.path.join(out_root, cid, fn)
            if os.path.exists(fp) and os.path.getsize(fp) > 2000: manifest[cid][l['text']] = fn; continue
            for attempt in range(3):
                try:
                    audio = tts(vid, cfg, l['text']); open(fp, 'wb').write(audio); manifest[cid][l['text']] = fn
                    print(f'  {i + 1}/{len(mine)} {fn} {len(audio) // 1000}KB', flush=True); break
                except RuntimeError as e:
                    print('  retry', attempt, e, flush=True); time.sleep(3 + attempt * 3)
            json.dump(manifest, open(mpath, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
            time.sleep(.3)
        json.dump(manifest, open(mpath, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print('done', {k: len(v) for k, v in manifest.items()})

if __name__ == '__main__': main()
