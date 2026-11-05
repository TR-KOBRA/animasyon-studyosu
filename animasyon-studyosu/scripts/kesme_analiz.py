"""Bir videonun kurgu ritmini ölçer: örnek/referans videoyu sayıya çevirir.

Sert kesmeleri iyi bulur; yumuşak geçişleri ve çok benzer kareleri kaçırır (denemede 36 çekimin
30'unu buldu), o yüzden sonuç yaklaşıktır.

usage: <araclar>/venv_goruntu/Scripts/python.exe -I kesme_analiz.py <video> [--sheet cikti.jpg]
"""
import subprocess, sys
from scenedetect import detect, AdaptiveDetector

video = sys.argv[1]
sheet = sys.argv[sys.argv.index("--sheet") + 1] if "--sheet" in sys.argv else None
sys.stdout.reconfigure(encoding="utf-8")
s = [(a.seconds, b.seconds) for a, b in detect(video, AdaptiveDetector())]
if not s: print("Kesme bulunamadı: tek plan ya da çok yumuşak geçişler."); sys.exit(0)
d = sorted(b - a for a, b in s); total = s[-1][1]
print(f"Süre {total:.1f} sn · {len(s)} çekim · ortalama {sum(d) / len(d):.2f} sn · orta değer {d[len(d) // 2]:.2f} sn · en kısa {d[0]:.2f} · en uzun {d[-1]:.2f}")
print(f"İlk 3 sn'de {sum(1 for a, _ in s if 0 < a < 3)} kesme · ilk kesme {s[1][0] if len(s) > 1 else total:.2f} sn")
for lo, hi in ((0, total / 3), (total / 3, 2 * total / 3), (2 * total / 3, total + 1)):
    x = [b - a for a, b in s if lo <= a < hi]
    if x: print(f"  {lo:5.1f}-{min(hi, total):5.1f} sn: {len(x)} çekim, ortalama {sum(x) / len(x):.2f} sn")
print("Kesmeler:", " ".join(f"{a:.2f}" for a, _ in s[1:]))
if sheet:
    cols = 6; rows = (len(s) + cols - 1) // cols
    sel = "+".join(f"between(t\\,{(a + b) / 2:.3f}\\,{(a + b) / 2 + 0.05:.3f})" for a, b in s)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", video, "-vf", f"select='{sel}',scale=216:-1,tile={cols}x{rows}:padding=4:color=white", "-frames:v", "1", "-fps_mode", "vfr", sheet])
    print("Kontak sayfası:", sheet)
