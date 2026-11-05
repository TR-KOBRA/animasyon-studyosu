"""Bağlantılar: API anahtarlarını güvenle tutar, neyin hazır olduğunu söyler, işe göre araç önerir.

  python baglan.py durum                  neler bağlı, neler eksik (anahtarı asla göstermez)
  python baglan.py dogrula                anahtarlar çalışıyor mu (kredi harcamayan bir istekle)
  python baglan.py oneri <is>             bu iş için en iyi araçlar; is: anlatim, parodi, gercekci, kurgu, muzik
  python baglan.py ekle <elevenlabs|gemini>   anahtar için küçük pencere açar (--terminal: terminalden gir); Claude'a yazma
  python baglan.py sil <elevenlabs|gemini>

Anahtar sırası: ortam değişkeni (ELEVENLABS_API_KEY, GEMINI_API_KEY), sonra ~/.config/animasyon-studyosu/anahtarlar.json.
Bu dosya skill klasörünün ve projelerin DIŞINDADIR, GitHub'a gitmez. Düz metin tutulur: bilgisayarını paylaşıyorsan ortam değişkeni kullan.
"""
import getpass, json, os, re, shutil, stat, sys, urllib.error, urllib.request

KEYFILE = os.path.join(os.path.expanduser("~"), ".config", "animasyon-studyosu", "anahtarlar.json")
ENV = {"elevenlabs": "ELEVENLABS_API_KEY", "gemini": "GEMINI_API_KEY"}
BICIM = {"elevenlabs": r"sk_[A-Za-z0-9_-]{20,}", "gemini": r"AIza[A-Za-z0-9_-]{30,}"}
ARAC = os.environ.get("ARACLAR") or os.path.join(os.path.expanduser("~"), "araclar")
SKILLS = os.path.join(os.path.expanduser("~"), ".claude", "skills")

def stored():
    try: return json.load(open(KEYFILE, encoding="utf-8"))
    except (OSError, ValueError): return {}

def temiz(name, s):
    """the key inside pasted text, or "" when there is none: extra words must never be stored or sent"""
    s = (s or "").strip()
    found = set(re.findall(BICIM[name], s))
    if len(found) == 1: return found.pop()
    return s if name != "elevenlabs" and re.fullmatch(r"[!-~]{20,200}", s) else ""  # ElevenLabs: without sk_ it is the key ID, not the key

def key(name):
    """the key for a service, or None; callers must never print it"""
    return temiz(name, os.environ.get(ENV[name]) or stored().get(name)) or None

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
        except urllib.error.HTTPError as e:
            try: why = json.load(e)["detail"]["message"]
            except (ValueError, KeyError, TypeError): why = ""
            print(f"  ❌ {name}: anahtar reddedildi (HTTP {e.code}) {why}".rstrip())
        except OSError as e: print(f"  ❌ {name}: bağlanılamadı ({e})")

def ozet(s):
    """the shape of pasted text with none of its content, so a failed paste can be explained"""
    s = s.strip()
    return f"{len(s)} karakter" + (", boşluklu" if re.search(r"\s", s) else "") + (", sk_ ile başlıyor" if s.startswith("sk_") else "") + (", özel işaretli" if not s.isascii() else "") if s else "pano boş"

def pencere(name):
    """a small masked window: the key never touches a terminal or the chat. An empty box never closes it,
    and the paste button works when Ctrl+V does not (Tk ignores it while Caps Lock is on)."""
    import tkinter as tk
    r = tk.Tk(); r.title(f"{name} anahtarı"); r.attributes("-topmost", True); r.resizable(False, False)
    out = {"k": "", "son": ""}
    tk.Label(r, text=f"{name} API anahtarını yapıştır. Sadece bu bilgisayarda saklanır.", padx=16, pady=10).pack()
    e = tk.Entry(r, show="•", width=52); e.pack(padx=16); e.focus_force()
    info = tk.Label(r, text="Önce sitede anahtarı kopyala, sonra Yapıştır'a bas.", pady=6); info.pack()
    def goster(*_):
        ok_ = bool(temiz(name, e.get()))
        info.config(text="Anahtar tamam, Kaydet'e bas." if ok_ else f"Anahtar değil: {out['son'] or 'kutu boş'}. Sitede sadece anahtarı kopyala.", fg="#1b6e2c" if ok_ else "#b00020")
    def yapistir(*_):
        try: k = r.clipboard_get()
        except tk.TclError: k = ""
        out["son"] = ozet(k); e.delete(0, "end"); e.insert(0, temiz(name, k)); goster(); return "break"
    def ok(*_):
        k = temiz(name, e.get())
        if not k: goster(); return
        out["k"] = k; r.destroy()
    row = tk.Frame(r); row.pack(pady=12)
    tk.Button(row, text="Yapıştır", command=yapistir, padx=20).pack(side="left", padx=6)
    tk.Button(row, text="Kaydet", command=ok, padx=20).pack(side="left", padx=6)
    r.bind("<Return>", ok); e.bind("<Control-V>", yapistir); e.bind("<Button-3>", yapistir); e.bind("<KeyRelease>", goster)
    r.update_idletasks(); r.geometry(f"+{(r.winfo_screenwidth() - r.winfo_width()) // 2}+{(r.winfo_screenheight() - r.winfo_height()) // 3}")
    r.mainloop()
    if not out["k"] and out["son"]: print(f"son yapıştırılan: {out['son']}", file=sys.stderr)
    return out["k"]

def ekle(name):
    if name not in ENV: sys.exit(f"bilinmeyen servis: {name}")
    if "--terminal" in sys.argv or not sys.stdin.isatty() and not sys.stdin.closed and "--pencere" not in sys.argv:
        print(f"{name} anahtarını gir. Bu bilgi sadece bu bilgisayarda kalır; Claude'a yazma.")
        k = (getpass.getpass("Anahtar: ") if sys.stdin.isatty() else sys.stdin.readline()).strip()
    else: k = pencere(name)
    k = temiz(name, k)
    if not k: sys.exit("anahtar girilmedi ya da anahtara benzemiyor, hiçbir şey yazılmadı")
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
    sys.stdout.reconfigure(encoding="utf-8"); sys.stderr.reconfigure(encoding="utf-8")
    a = sys.argv[1:]
    if not a: print(__doc__); sys.exit(0)
    if a[0] == "durum": durum()
    elif a[0] == "dogrula": dogrula()
    elif a[0] == "oneri" and len(a) > 1: oneri(a[1])
    elif a[0] == "ekle" and len(a) > 1: ekle(a[1])
    elif a[0] == "sil" and len(a) > 1: sil(a[1])
    else: print(__doc__); sys.exit(2)
