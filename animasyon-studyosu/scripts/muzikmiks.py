"""The music laid over the sound bed: places the track so its strongest hit lands on a chosen film moment,
takes it out for chosen silent beats, fades it at the end, ducks it under the voice.

usage: python -I muzikmiks.py <film .ts> <bed.wav> <track> <out.wav> [--voice voice.wav]
       [--vurus muzik_sn,film_sn] [--sessiz cekim1,cekim2] [--seviye -5]
--vurus 103.0,83.0: the track's second 103 lands on the film's second 83 (find it with vurus_izgara.py).
--sessiz dark: the music goes out for that shot and comes back after it.
"""
import re, subprocess, sys, numpy as np

SR = 48000
src, bedf, track, out = sys.argv[1:5]
voice = sys.argv[sys.argv.index("--voice") + 1] if "--voice" in sys.argv else None
ts = open(src, encoding="utf-8").read()
SHOTS = {k: (float(a), float(b)) for a, b, k in re.findall(r'\{ a: ([\d.]+), b: ([\d.]+), k: "(\w+)" \}', ts[ts.index("const SHOTS"):ts.index("];", ts.index("const SHOTS"))])}
LINES = [(float(a), float(b)) for a, b, _ in re.findall(r'\[([\d.]+), ([\d.]+), "([^"]+)"\]', ts[ts.index("const LINES"):ts.index("];", ts.index("const LINES"))])]
def opt(n, d=None): return sys.argv[sys.argv.index(n) + 1] if n in sys.argv else d
vt, vf = (float(x) for x in opt("--vurus", "0,0").split(","))
OFFSET = vt - vf
DUR = float(re.search(r"DURATION = (\d+)", ts).group(1)) / int(re.search(r"const FPS = (\d+)", ts).group(1))

def load(path, ch=2):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", str(ch), "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, ch).copy()

bed = load(bedf); N = len(bed); T = np.arange(N) / SR
mus = load(track)
if OFFSET >= 0: mus = mus[int(OFFSET * SR):][:N]
else: mus = np.pad(mus, ((int(-OFFSET * SR), 0), (0, 0)))[:N]
if len(mus) < N: mus = np.pad(mus, ((0, N - len(mus)), (0, 0)))

def ramp(a, b): return np.clip((T - a) / max(b - a, 1e-6), 0, 1)
gain = np.full(N, 10 ** (float(opt("--seviye", -5)) / 20), np.float32)   # the music's place under everything
gain *= ramp(0.0, 1.5)                                              # in over the first second and a half
for k in filter(None, opt("--sessiz", "").split(",")):
    if k not in SHOTS: sys.exit(f"HATA: '{k}' çekimi filmde yok: {sorted(SHOTS)}")
    d0, d1 = SHOTS[k]; gain *= 1 - ramp(d0 - 0.15, d0) + ramp(d1, d1 + 0.8)   # out for the beat, back after it
gain *= 1 - ramp(DUR - 3.0, DUR)                                    # bow out
if voice:
    v = load(voice, 1)[:N, 0]; v = np.pad(v, (0, max(0, N - len(v))))
    k = SR // 20; envv = np.sqrt(np.convolve(v ** 2, np.ones(k) / k, mode="same"))
    duck = 1 - 0.6 * np.clip(envv / (np.percentile(envv, 95) + 1e-9), 0, 1)   # about -8 dB under the voice
    gain *= duck.astype(np.float32); vv = np.stack([v, v], 1)
else:
    vv = 0
mix = bed + mus * gain[:, None] + vv
peak = float(np.max(np.abs(mix)))
if peak > 0.95: mix = np.tanh(mix * 1.1) / np.tanh(1.1) * 0.95 / max(1.0, peak / 1.5)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", out], input=mix.astype(np.float32).tobytes(), check=True)
print("mix", out, f"offset {OFFSET:.2f}s", "peak", round(float(np.max(np.abs(mix))), 3))
