"""ElevenLabs: anlatım, efekt ve müzik üretir. Anahtar için: python baglan.py ekle elevenlabs

  python eleven.py sesler [--ara kelime]
  python eleven.py konus --metin metin.txt --ses <voice_id> --out kayit/ham.wav --kelimeler kayit/kelimeler.json [--model id] [--onay]
  python eleven.py efekt "yağmurlu sokak" --sure 4 --out ses/yagmur.mp3 [--dongu] [--onay]
  python eleven.py muzik "gerilimli piyano" --sure 30 --out ses/muzik.mp3 [--sozlu] [--model music_v2_5] [--onay]

Üretim kredi harcar: --onay olmadan sadece ne yapılacağını ve metin uzunluğunu söyler, hiçbir şey göndermez.
konus, kelime zamanlarını da yazar: yaziya_dok.py adımı gerekmez, seslendirme_oturt.py doğrudan kullanılır.
"""
import base64, json, os, subprocess, sys, tempfile, urllib.error, urllib.parse, urllib.request
from baglan import key

BASE = os.environ.get("ELEVEN_BASE_URL", "https://api.elevenlabs.io")
a = sys.argv[1:]
sys.stdout.reconfigure(encoding="utf-8")
def opt(n, d=None): return a[a.index(n) + 1] if n in a else d
def die(m): print("HATA:", m); sys.exit(1)

def api(path, body=None):
    k = key("elevenlabs")
    if not k: die("ElevenLabs anahtarı yok. Pencere için: python baglan.py ekle elevenlabs")
    h = {"xi-api-key": k}
    if body is not None: h["Content-Type"] = "application/json"
    req = urllib.request.Request(BASE + path, data=None if body is None else json.dumps(body).encode(), headers=h)
    try:
        with urllib.request.urlopen(req, timeout=300) as r: return r.read()
    except urllib.error.HTTPError as e:
        msg = e.read().decode("utf-8", "replace")[:300]
        if e.code == 401: die("anahtar geçersiz ya da bu işlem için yetkisi yok (401). Hesaptaki anahtar izinlerine bak.")
        if e.code == 402: die("kredi yetmiyor ya da bu özellik planında yok (402).")
        if e.code == 429: die("çok fazla istek ya da kota doldu (429). Biraz sonra dene.")
        die(f"ElevenLabs {e.code}: {msg}")
    except OSError as e: die(f"bağlanılamadı: {e}")

def gate(text):
    if "--onay" not in a: print(text + "\nBu işlem kredi harcar. Kullanıcı onaylarsa aynı komutu --onay ile çalıştır."); sys.exit(0)

def ensure_dir(p):
    d = os.path.dirname(p)
    if d: os.makedirs(d, exist_ok=True)

def words_from(al):
    """character timings -> the word list seslendirme_oturt.py reads"""
    out, cur, s, e = [], "", None, None
    for ch, t0, t1 in zip(al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]):
        if ch.isspace():
            if cur: out.append({"w": cur, "a": round(s, 3), "b": round(e, 3), "p": 1.0})
            cur, s = "", None
        else:
            if s is None: s = t0
            cur += ch; e = t1
    if cur: out.append({"w": cur, "a": round(s, 3), "b": round(e, 3), "p": 1.0})
    return out

cmd = a[0] if a else ""
if cmd == "sesler":
    vs = json.loads(api("/v2/voices?page_size=100" + (f"&search={urllib.parse.quote(opt('--ara'))}" if opt("--ara") else ""))).get("voices", [])
    for v in vs: print(v["voice_id"], v.get("name", ""))
    print(len(vs), "ses")
elif cmd == "konus":
    src, voice, out, wj = opt("--metin"), opt("--ses"), opt("--out"), opt("--kelimeler")
    if not (src and voice and out and wj): die("--metin, --ses, --out, --kelimeler gerekli")
    text = open(src, encoding="utf-8").read().strip()
    if not text: die("metin boş")
    gate(f"Anlatım: {len(text)} karakter, ses {voice}, model {opt('--model', 'varsayılan')}.")
    body = {"text": text}
    if opt("--model"): body["model_id"] = opt("--model")
    d = json.loads(api(f"/v1/text-to-speech/{urllib.parse.quote(voice)}/with-timestamps?output_format=mp3_44100_128", body))
    al = d.get("alignment") or d.get("normalized_alignment")
    if not al: die("yanıtta kelime zamanı yok; sesi yaziya_dok.py ile yazıya dök")
    ensure_dir(out); ensure_dir(wj)
    with tempfile.TemporaryDirectory() as t:
        mp3 = os.path.join(t, "s.mp3"); open(mp3, "wb").write(base64.b64decode(d["audio_base64"]))
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mp3, "-ac", "1", "-ar", "48000", out], check=True)
    w = words_from(al)
    json.dump({"text": text, "words": w}, open(wj, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    open(os.path.splitext(wj)[0] + ".txt", "w", encoding="utf-8").write("".join(f"{i:3d} {x['a']:7.2f} {x['b']:7.2f} {x['p']:.2f} {x['w']}\n" for i, x in enumerate(w)))
    print(f"hazır: {out}, {len(w)} kelime, {w[-1]['b']:.1f} sn")
elif cmd == "efekt":
    text, out = (a[1] if len(a) > 1 else None), opt("--out")
    if not text or text.startswith("--") or not out: die('kullanım: efekt "tarif" --out dosya.mp3')
    sure = float(opt("--sure", 0)) or None
    if sure and not 0.5 <= sure <= 30: die("--sure 0,5 ile 30 sn arasında olmalı")
    gate(f"Efekt: \"{text}\", {sure or 'otomatik'} sn.")
    body = {"text": text, "loop": "--dongu" in a}
    if sure: body["duration_seconds"] = sure
    ensure_dir(out); open(out, "wb").write(api("/v1/sound-generation", body)); print("hazır:", out)
elif cmd == "muzik":
    text, out = (a[1] if len(a) > 1 else None), opt("--out")
    if not text or text.startswith("--") or not out: die('kullanım: muzik "tarif" --sure 30 --out dosya.mp3')
    sure = float(opt("--sure", 30))
    if not 3 <= sure <= 600: die("--sure 3 ile 600 sn arasında olmalı")
    gate(f"Müzik: \"{text}\", {sure:.0f} sn, {'sözlü olabilir' if '--sozlu' in a else 'enstrümantal'}.")
    body = {"prompt": text, "music_length_ms": int(sure * 1000), "force_instrumental": "--sozlu" not in a}
    if opt("--model"): body["model_id"] = opt("--model")
    ensure_dir(out); open(out, "wb").write(api("/v1/music", body)); print("hazır:", out)
else: print(__doc__); sys.exit(2)
