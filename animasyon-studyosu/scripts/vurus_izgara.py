"""Müziğin vuruş ızgarasını çıkarır, doğrular ve kesmelerin vuruşa uzaklığını ms olarak söyler.

librosa bazen ara vuruşa kilitlenir. Bu yüzden ızgara, 120 Hz altındaki bas vuruşlarıyla (kick) karşılaştırılır;
kayma varsa tüm ızgara kaydırılır. Sonuç bir sayıdır, kulak değil: kesin anları kullanıcıya dinlet.

usage: <araclar>/venv/Scripts/python.exe -I vurus_izgara.py <muzik> [--kesmeler 1.2,3.4 | --film ad.ts] [--ofset sn] [--json cikti.json]
--ofset: müziğin filmde başladığı an (film saniyesi = müzik saniyesi + ofset).
"""
import json, re, sys
import librosa, numpy as np

a = sys.argv[1:]
def opt(n, d=None): return a[a.index(n) + 1] if n in a else d
sys.stdout.reconfigure(encoding="utf-8")
y, sr = librosa.load(a[0], sr=22050, mono=True)
tempo, fr = librosa.beat.beat_track(y=y, sr=sr)
beats = librosa.frames_to_time(fr, sr=sr)
tempo = float(np.atleast_1d(tempo)[0])
# the low band only: where the kicks really land
S = np.abs(librosa.stft(y, n_fft=2048, hop_length=512)); low = S[librosa.fft_frequencies(sr=sr, n_fft=2048) < 120].sum(axis=0)
env = np.maximum(0, np.diff(low, prepend=low[0])); kf = librosa.util.peak_pick(env, pre_max=3, post_max=3, pre_avg=5, post_avg=5, delta=float(env.std()), wait=8)
kicks = librosa.frames_to_time(kf, sr=sr, hop_length=512)
shift = 0.0
if len(kicks) and len(beats):
    d = [k - beats[np.argmin(np.abs(beats - k))] for k in kicks]
    shift = float(np.median(d))
    half = 30 / tempo
    print(f"Tempo {tempo:.1f} BPM · {len(beats)} vuruş · {len(kicks)} bas vuruşu · ızgara kayması {shift * 1000:+.0f} ms" + (" · ARA VURUŞA KİLİTLENMİŞ OLABİLİR" if abs(shift) > half * 0.6 else ""))
else: print(f"Tempo {tempo:.1f} BPM · {len(beats)} vuruş · bas vuruşu bulunamadı, ızgara doğrulanamadı")
beats = beats + (shift if abs(shift) > 0.015 else 0)
off = float(opt("--ofset", 0)); grid = beats + off
cuts = []
if opt("--kesmeler"): cuts = [float(x) for x in opt("--kesmeler").split(",")]
elif opt("--film"): cuts = [float(x) for x in re.findall(r'\{ a: ([\d.]+), b:', open(opt("--film"), encoding="utf-8").read())][1:]
if cuts:
    err = [(c, (c - grid[np.argmin(np.abs(grid - c))]) * 1000) for c in cuts]
    print("Kesme → vuruş hatası (ms):", " ".join(f"{c:.2f}:{e:+.0f}" for c, e in err))
    print(f"Ortalama mutlak hata {np.mean([abs(e) for _, e in err]):.0f} ms · en kötü {max(abs(e) for _, e in err):.0f} ms (bir kare ~33 ms)")
if opt("--json"): json.dump({"tempo": tempo, "shift": shift, "beats": [round(float(b), 3) for b in grid]}, open(opt("--json"), "w"))
