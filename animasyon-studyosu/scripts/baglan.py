"""Bağlantılar: API anahtarlarını güvenle tutar, neyin hazır olduğunu söyler, işe göre araç önerir.

  python baglan.py durum                  neler bağlı, neler eksik (anahtarı asla göstermez)
  python baglan.py dogrula                anahtarlar çalışıyor mu (kredi harcamayan bir istekle)
  python baglan.py oneri <is>             bu iş için en iyi araçlar; is: anlatim, parodi, gercekci, kurgu, muzik
  python baglan.py ekle <elevenlabs|gemini>   anahtarı KENDİ terminalinde gir (Claude'a yazma)
  python baglan.py sil <elevenlabs|gemini>

Anahtar sırası: ortam değişkeni (ELEVENLABS_API_KEY, GEMINI_API_KEY), sonra ~/.config/animasyon-studyosu/anahtarlar.json.
Bu dosya skill klasörünün ve projelerin DIŞINDADIR, GitHub'a gitmez. Düz metin tutulur: bilgisayarını paylaşıyorsan ortam değişkeni kullan.
"""
import getpass, json, os, shutil, stat, sys, urllib.error, urllib.request

KEYFILE = os.path.join(os.path.expanduser("~"), ".config", "animasyon-studyosu", "anahtarlar.json")
ENV = {"elevenlabs": "ELEVENLABS_API_KEY", "gemini": "GEMINI_API_KEY"}
ARAC = os.environ.get("ARACLAR") or os.path.join(os.path.expanduser("~"), "araclar")
SKILLS = os.path.join(os.path.expanduser("~"), ".claude", "skills")

def stored():
    try: return json.load(open(KEYFILE, encoding="utf-8"))
    except (OSError, ValueError): return {}

def key(name):
    """the key for a service, or None; callers must never print it"""
    return os.environ.get(ENV[name]) or stored().get(name)

def venv_has(venv, mod):
    return any(os.path.isdir(os.path.join(ARAC, venv, p, mod)) for p in ("Lib/site-packages", f"lib/python{sys.version_info[0]}.{sys.version_info[1]}/site-packages"))

def checks():
    """what is ready on this machine: (id, label, ready, how to get it)"""
    w = lambda *p: os.path.exists(os.path.join(*p))
    return [
        ("motor", "Çizim motoru (anidoodle)", w(SKILLS, "anidoodle", "engine", "node_modules"), "bash kur.sh"),
        ("ffmpeg", "FFmpeg", bool(shutil.which("ffmpeg")), "ffmpeg.org ya da winget install ffmpeg"),
        ("whisper", "Yazıya dökme (faster-whisper)", venv_has("venv", "faster_whisper"), "bash kur.sh --ses"),
        ("hyperframes", "HTML kurgu (hyperframes)", w(SKILLS, "hyperframes"), "npx hyperframes skills update"),
        ("elevenlabs", "ElevenLabs (ses, efekt, müzik)", bool(key("elevenlabs")), "elevenlabs.io > API Keys, sonra: python baglan.py ekle elevenlabs"),
        ("gemini", "Gemini Omni Flash (API ile AI video)", bool(key("gemini")), "aistudio.google.com > API key, sonra: python baglan.py ekle gemini"),
        ("sahne", "Sahne analizi, özne ayırma", venv_has("venv_goruntu", "scenedetect"), "venv_goruntu: scenedetect, rembg[cpu,cli]"),
        ("rhubarb", "Ağız senkronu (Rhubarb)", w(ARAC, "rhubarb"), "github.com/DanielSWolf/rhubarb-lip-sync sürümünü ~/araclar/rhubarb altına aç"),
        ("rife", "Ara kare (RIFE)", w(ARAC, "rife"), "github.com/nihui/rife-ncnn-vulkan sürümünü ~/araclar/rife altına aç"),
    ]

# what each kind of job wants: (tool id, why, what happens without it)
ONERI = {
    "anlatim": [("motor", "kodla çizim", None), ("ffmpeg", "render ve ses", None), ("whisper", "kendi kaydını sahnelere oturtmak", "AI ses seçilirse gerekmez"),
                ("elevenlabs", "kullanıcı kayıt yapmayacaksa anlatım; ayrıca özel efekt ve müzik", "kullanıcının kendi kaydı + hazır efektler")],
    "parodi": [("motor", "karakter animasyonu", None), ("ffmpeg", "render ve ses", None), ("elevenlabs", "karakter sesleri, efekt", "elle kayıt"),
               ("rhubarb", "ağız sese otomatik uyar", "ağızlar ses şiddetine göre açılır kapanır")],
    "gercekci": [("ffmpeg", "kurgu", None), ("gemini", "videoyu API ile otomatik üretmek", "Flow'da tarayıcıdan üretim (kullanıcı aboneliği)"),
                 ("rife", "24 kareyi 30'a çıkarma, ağır çekim", "kliplerin kendi hızı"), ("elevenlabs", "anlatım, efekt, müzik", "Veo'nun kendi sesi")],
    "kurgu": [("ffmpeg", "kurgu", None), ("sahne", "örnek videoyu ölçmek, özne ayırmak", "gözle inceleme"), ("hyperframes", "grafik ve yazı katmanı", "ffmpeg ile yalın yazı")],
    "muzik": [("ffmpeg", "ses", None), ("elevenlabs", "videoya özel müzik", "lisansı kontrol edilmiş hazır parça")],
}

def durum():
    print("Bağlantı durumu:")
    for _, label, ok, how in checks():
        print(f"  {'✅' if ok else '⬜'} {label}" + ("" if ok else f"  →  {how}"))

def oneri(job):
    if job not in ONERI: sys.exit(f"bilinmeyen iş: {job}. Seçenekler: {', '.join(ONERI)}")
    c = {i: (label, ok, how) for i, label, ok, how in checks()}
    must, better = [], []
    print(f"'{job}' işi için:")
    for i, why, fallback in ONERI[job]:
        label, ok, how = c[i]
        print(f"  {'✅' if ok else '⬜'} {label}: {why}" + ("" if ok else f"  (yoksa: {fallback or 'iş yapılamaz'})"))
        if not ok: (better if fallback else must).append((label, how))
    for label, how in must: print(f"ŞART: {label}  →  {how}")
    for label, how in better: print(f"ÖNERİ: {label}  →  {how}")
    if not must and not better: print("Her şey hazır.")

def dogrula():
    tests = {"elevenlabs": (os.environ.get("ELEVEN_BASE_URL", "https://api.elevenlabs.io") + "/v2/voices?page_size=1", "xi-api-key"),
             "gemini": (os.environ.get("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com") + "/v1beta/models?pageSize=1", "x-goog-api-key")}
    for name, (url, header) in tests.items():
        k = key(name)
        if not k: print(f"  ⬜ {name}: anahtar yok"); continue
        try:
            urllib.request.urlopen(urllib.request.Request(url, headers={header: k}), timeout=20); print(f"  ✅ {name}: anahtar çalışıyor")
        except urllib.error.HTTPError as e: print(f"  ❌ {name}: anahtar reddedildi (HTTP {e.code})")
        except OSError as e: print(f"  ❌ {name}: bağlanılamadı ({e})")

def ekle(name):
    if name not in ENV: sys.exit(f"bilinmeyen servis: {name}")
    print(f"{name} anahtarını gir. Bu bilgi sadece bu bilgisayarda kalır; Claude'a yazma.")
    k = (getpass.getpass("Anahtar: ") if sys.stdin.isatty() else sys.stdin.readline()).strip()
    if not k: sys.exit("boş anahtar, hiçbir şey yazılmadı")
    d = stored(); d[name] = k
    os.makedirs(os.path.dirname(KEYFILE), exist_ok=True)
    with open(KEYFILE, "w", encoding="utf-8") as f: json.dump(d, f)
    os.chmod(KEYFILE, stat.S_IRUSR | stat.S_IWUSR)
    print(f"Kaydedildi: {KEYFILE}. Kontrol için: python baglan.py dogrula")

def sil(name):
    d = stored()
    if d.pop(name, None) is None: print("kayıtlı anahtar yok")
    else:
        with open(KEYFILE, "w", encoding="utf-8") as f: json.dump(d, f)
        print(f"{name} anahtarı silindi. Sızdıysa servisin sitesinden de iptal et.")

if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    a = sys.argv[1:]
    if not a: print(__doc__); sys.exit(0)
    if a[0] == "durum": durum()
    elif a[0] == "dogrula": dogrula()
    elif a[0] == "oneri" and len(a) > 1: oneri(a[1])
    elif a[0] == "ekle" and len(a) > 1: ekle(a[1])
    elif a[0] == "sil" and len(a) > 1: sil(a[1])
    else: print(__doc__); sys.exit(2)
