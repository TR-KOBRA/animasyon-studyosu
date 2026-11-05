"""Gemini Omni Flash ile API üzerinden video üretir. Anahtar için: python baglan.py ekle gemini

  python omni.py --prompt "sahne tarifi" --out klip.mp4 [--ilk a.png] [--son b.png] [--ref r1.png --ref r2.png]
                 [--oran 9:16] [--cozunurluk 720p] [--onay]

--ilk: bu kareden başlar. --ilk ve --son: iki kare arası geçiş. --ref: nesne/karakter referansı.
Olumsuz istekler prompta yazılır ("Do not ..."). Abonelikten ayrı, Google Cloud faturasına yazar: --onay olmadan hiçbir şey göndermez.
Flow'un API'si yoktur; Flow kredileri burada geçmez. Fiyatı üretimden önce Gemini API fiyat sayfasından kontrol et.
"""
import base64, json, mimetypes, os, re, sys, time, urllib.error, urllib.request
from baglan import key

BASE = os.environ.get("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com")
MODEL = os.environ.get("OMNI_MODEL", "gemini-omni-1.1-flash")
a = sys.argv[1:]
sys.stdout.reconfigure(encoding="utf-8")
def opt(n, d=None): return a[a.index(n) + 1] if n in a else d
def die(m): print("HATA:", m); sys.exit(1)
if not a or "--prompt" not in a or "--out" not in a: print(__doc__); sys.exit(2)
prompt, out = opt("--prompt"), opt("--out")
ilk, son = opt("--ilk"), opt("--son"); refs = [a[i + 1] for i, x in enumerate(a) if x == "--ref"]
if son and not ilk: die("--son için --ilk de gerekli")
if (ilk or son) and refs: die("kare ile --ref birlikte kullanılmaz")
images = [p for p in (ilk, son) if p] + refs
for p in images:
    if not os.path.exists(p): die(f"dosya yok: {p}")
oran, coz = opt("--oran", "9:16"), opt("--cozunurluk", "720p")
if "--onay" not in a:
    print(f"Video: {MODEL}, {oran}, {coz}, {len(images)} görsel. Prompt: {prompt[:120]}\nBu işlem API faturasına yazar. Kullanıcı onaylarsa aynı komutu --onay ile çalıştır."); sys.exit(0)
k = key("gemini")
if not k: die("Gemini anahtarı yok. Kullanıcı kendi terminalinde çalıştırsın: python baglan.py ekle gemini")

def call(path, body=None, raw=False):
    h = {"x-goog-api-key": k}
    if body is not None: h["Content-Type"] = "application/json"
    req = urllib.request.Request(BASE + path, data=None if body is None else json.dumps(body).encode(), headers=h)
    try:
        with urllib.request.urlopen(req, timeout=600) as r: d = r.read()
        return d if raw else json.loads(d)
    except urllib.error.HTTPError as e:
        msg = e.read().decode("utf-8", "replace")[:300]
        if e.code in (401, 403): die(f"anahtar reddedildi ya da faturalandırma kapalı ({e.code}): {msg}")
        if e.code == 429: die("kota doldu (429). Biraz sonra dene.")
        die(f"Gemini {e.code}: {msg}")
    except OSError as e: die(f"bağlanılamadı: {e}")

def find_video(x):
    """the first video part anywhere in the response: the layout around it may change"""
    if isinstance(x, dict):
        if x.get("type") == "video" and (x.get("uri") or x.get("data")): return x
        x = list(x.values())
    if isinstance(x, list):
        for v in x:
            r = find_video(v)
            if r: return r
    return None

parts = [{"type": "image", "data": base64.b64encode(open(p, "rb").read()).decode(), "mime_type": mimetypes.guess_type(p)[0] or "image/png"} for p in images]
parts.append({"type": "text", "text": prompt})
d = call("/v1beta/interactions", {"model": MODEL, "input": parts if images else prompt, "response_format": {"type": "video", "aspect_ratio": oran, "resolution": coz, "delivery": "uri"}})
v = find_video(d)
if not v: die("yanıtta video yok: " + json.dumps(d)[:300])
if os.path.dirname(out): os.makedirs(os.path.dirname(out), exist_ok=True)
if v.get("data"): open(out, "wb").write(base64.b64decode(v["data"]))
else:
    m = re.search(r"files/([^/:?]+)", v["uri"])
    if not m: die("beklenmeyen video adresi: " + v["uri"][:120])
    fid = m.group(1)
    for _ in range(120):
        st = call(f"/v1beta/files/{fid}").get("state")
        if st == "ACTIVE": break
        if st == "FAILED": die("üretim başarısız oldu")
        time.sleep(5)
    else: die("10 dakikada hazır olmadı")
    open(out, "wb").write(call(f"/v1beta/files/{fid}:download?alt=media", raw=True))
print("hazır:", out, os.path.getsize(out) // 1024, "KB")
