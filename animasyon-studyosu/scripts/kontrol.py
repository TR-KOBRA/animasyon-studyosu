"""Teslim öncesi otomatik kontrol (kalite kapısı 6). Sadece ffmpeg/ffprobe kullanır; herhangi bir Python'la çalışır.

Kontroller: çözünürlük ve fps, süre (--max sn), ses var mı, entegre ses yüksekliği (-14 LUFS ±1),
gerçek tepe (≤ -1 dBTP), siyah kareler, donmuş görüntü (>1,5 sn), uzun sessizlik (>1,2 sn, son 2 sn hariç).
Ayrıca her çekimin ortasından bir kare alıp tek bir kontrol sayfası çıkarır (--film verilirse SHOTS'tan,
yoksa her 3 sn'de bir): altyazı yazımını, logoyu, kesik nesneleri GÖZLE kontrol etmek için.

usage: python kontrol.py <video.mp4> [--film src/canvas-core/<ad>.ts] [--max 89] [--w 1080 --h 1920 --fps 30]
Çıktı: <video>_kontrol.md ve <video>_kontrol.jpg (aynı klasörde). Çıkış kodu: 0 temiz, 1 sorun var.
"""
import json, os, re, subprocess, sys

args = sys.argv[1:]
if not args or args[0].startswith("--"): print(__doc__); sys.exit(2)
video = args[0]
sys.stdout.reconfigure(encoding="utf-8")
if not os.path.exists(video): print("HATA: dosya yok:", video); sys.exit(2)
def opt(name, default=None):
    return args[args.index(name) + 1] if name in args else default
film, mx = opt("--film"), float(opt("--max", "0") or 0)
W, H, FPS = int(opt("--w", 1080)), int(opt("--h", 1920)), float(opt("--fps", 30))

def run(cmd): return subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
probe = json.loads(run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", video]).stdout)
vs = next(s for s in probe["streams"] if s["codec_type"] == "video"); aus = [s for s in probe["streams"] if s["codec_type"] == "audio"]
dur = float(probe["format"]["duration"]); num, den = map(int, vs["r_frame_rate"].split("/")); fps = num / den
rows, bad = [], 0
def check(name, ok, detail):
    global bad
    rows.append(f"| {'✅' if ok else '❌'} | {name} | {detail} |"); bad += 0 if ok else 1

check("Çözünürlük", vs["width"] == W and vs["height"] == H, f"{vs['width']}x{vs['height']} (beklenen {W}x{H})")
check("Kare hızı", abs(fps - FPS) < 0.01, f"{fps:.2f} fps")
check("Süre", (dur <= mx + 0.05) if mx else True, f"{dur:.2f} sn" + (f" (en fazla {mx:.0f})" if mx else ""))
check("Ses kanalı", bool(aus), "var" if aus else "YOK")

if aus:
    e = run(["ffmpeg", "-hide_banner", "-nostats", "-i", video, "-af", "ebur128=peak=true", "-f", "null", "-"]).stderr
    summ = e[e.rfind("Summary:"):]
    I = float(re.search(r"I:\s+(-?[\d.]+) LUFS", summ).group(1)); tp = re.search(r"Peak:\s+(-?[\d.inf]+) dBFS", summ)
    tpv = float(tp.group(1)) if tp and "inf" not in tp.group(1) else -99.0
    check("Ses yüksekliği", abs(I + 14) <= 1.0, f"{I:.1f} LUFS (hedef -14)")
    check("Gerçek tepe", tpv <= -1.0, f"{tpv:.1f} dBTP (en fazla -1)")
    s = run(["ffmpeg", "-hide_banner", "-nostats", "-i", video, "-af", "silencedetect=n=-45dB:d=1.2", "-f", "null", "-"]).stderr
    sil = [(float(a), float(b)) for a, b in re.findall(r"silence_start: ([\d.]+).*?silence_end: ([\d.]+)", s, re.S) if float(a) < dur - 2]
    check("Uzun sessizlik", not sil, ", ".join(f"{a:.1f}-{b:.1f} sn" for a, b in sil) or "yok")

b = run(["ffmpeg", "-hide_banner", "-nostats", "-i", video, "-vf", "blackdetect=d=0.1:pix_th=0.08", "-an", "-f", "null", "-"]).stderr
blk = re.findall(r"black_start:([\d.]+) black_end:([\d.]+)", b)
check("Siyah kare", not blk, ", ".join(f"{float(a):.1f}-{float(c):.1f} sn" for a, c in blk) or "yok")
fz = run(["ffmpeg", "-hide_banner", "-nostats", "-i", video, "-vf", "freezedetect=n=0.0005:d=1.5", "-an", "-f", "null", "-"]).stderr
frz = [float(x) for x in re.findall(r"freeze_start: ([\d.]+)", fz)]
check("Donmuş görüntü (>1,5 sn)", not frz, ", ".join(f"{x:.1f} sn" for x in frz) or "yok")

# the review sheet: one frame from the middle of every shot
marks = []
if film and os.path.exists(film):
    ts = open(film, encoding="utf-8").read()
    marks = [((float(a) + float(c)) / 2, k) for a, c, k in re.findall(r'\{ a: ([\d.]+), b: ([\d.]+), k: "(\w+)" \}', ts)]
if not marks: marks = [(t + 1.5, f"{t:.0f}s") for t in range(0, int(dur), 3)]
marks = [(t, k) for t, k in marks if t < dur]
frames = sorted({min(int(t * fps), int(dur * fps) - 1) for t, _ in marks})
cols = 6; rows_n = (len(frames) + cols - 1) // cols
base = os.path.splitext(video)[0]; sheet = base + "_kontrol.jpg"
sel = "+".join(f"eq(n\\,{n})" for n in frames)
run(["ffmpeg", "-v", "error", "-y", "-i", video, "-vf", f"select='{sel}',scale=216:-1,tile={cols}x{rows_n}:padding=4:color=white", "-frames:v", "1", "-fps_mode", "vfr", sheet])

rep = [f"# Teslim kontrolü: {os.path.basename(video)}", "", "| | Kontrol | Sonuç |", "|---|---|---|", *rows, "",
       f"Kontrol sayfası: `{sheet}` ({len(frames)} kare, çekim ortaları; soldan sağa, yukarıdan aşağı):",
       ", ".join(k for _, k in sorted(marks)), "",
       "Gözle bak: altyazı yazımı, logo yerinde mi, resmin ortasında yazı var mı, kesik/taşan nesne, boş kare.",
       "", "SONUÇ: " + ("TEMİZ" if not bad else f"{bad} SORUN")]
open(base + "_kontrol.md", "w", encoding="utf-8").write("\n".join(rep))
print("\n".join(rep))
sys.exit(1 if bad else 0)
