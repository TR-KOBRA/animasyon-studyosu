"""The sound bed: typewriter strikes for every letter that is inked in, the place's murmur shaped scene
by scene, and the effects tied to what happens on screen. No music and no voice here; those are mixed
over this bed at the end. Each film's own sounds live in its efektler.py (see efekt_ornegi.py).

Timing is read from the film itself (LINES and SHOTS in the film file) so the clicks follow the
captions exactly; when the narration is retimed to the recording, re-run this and the clicks follow.

usage: python -I sesmiks.py <film .ts> <sound dir> <out.wav> [efektler.py]
"""
import os, re, subprocess, sys, numpy as np

SR = 48000
src, sdir, out = sys.argv[1], sys.argv[2], sys.argv[3]
fx = sys.argv[4] if len(sys.argv) > 4 else None
ts = open(src, encoding="utf-8").read()
LINES = [(float(a), float(b), t) for a, b, t in re.findall(r'\[([\d.]+), ([\d.]+), "([^"]+)"\]', ts[ts.index("const LINES"):ts.index("];", ts.index("const LINES"))])]
SHOTS = {k: (float(a), float(b)) for a, b, k in re.findall(r'\{ a: ([\d.]+), b: ([\d.]+), k: "(\w+)" \}', ts[ts.index("const SHOTS"):ts.index("];", ts.index("const SHOTS"))])}
DUR = float(re.search(r"DURATION = (\d+)", ts).group(1)) / int(re.search(r"const FPS = (\d+)", ts).group(1))
sys.stdout.reconfigure(encoding="utf-8")
if not LINES: print("UYARI: filmde altyazı satırı bulunamadı, daktilo sesi olmayacak")

def load(name, af=None):
    """decode any file to mono float32 at SR through ffmpeg (af: an ffmpeg filter on the way)"""
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f"{sdir}/{name}", *(["-af", af] if af else []), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()

def trim(x, a=0.0, b=None, fade=0.01):
    """seconds a..b of a sound, with short fades so nothing clicks"""
    y = x[int(a * SR): None if b is None else int(b * SR)].copy(); n = int(fade * SR)
    if n and len(y) > 2 * n: y[:n] *= np.linspace(0, 1, n); y[-n:] *= np.linspace(1, 0, n)
    return y

def norm(x, peak=0.9):
    m = np.max(np.abs(x)) or 1; return x * (peak / m)

def onset(x, thresh=0.08):
    """where a one-shot recording actually starts (skip its lead-in silence)"""
    i = np.argmax(np.abs(x) > thresh * np.max(np.abs(x))); return x[max(0, i - int(0.004 * SR)):]

bed = np.zeros(int(DUR * SR) + SR, np.float32)
def put(x, t, gain_db=0.0):
    i = int(t * SR); g = 10 ** (gain_db / 20); j = min(len(bed), i + len(x))
    if i < len(bed) and j > i: bed[i:j] += x[: j - i] * g

rng = np.random.default_rng(7)
KEY, SPACE = "2842_daktilo_tus.flac", "2843_daktilo_bosluk.flac"
has_keys = os.path.exists(f"{sdir}/{KEY}") and os.path.exists(f"{sdir}/{SPACE}")
if has_keys:
    key = norm(onset(load(KEY)))[: int(0.18 * SR)]; space = norm(onset(load(SPACE)))[: int(0.25 * SR)]
else: print(f"UYARI: {sdir} içinde daktilo sesleri yok, altyazı sessiz yazılacak")
def typing(text, t0, write, gain=-21.0):
    """one strike per letter, in step with the inked caption (letter k lands at t0 + write * k / n)"""
    if not has_keys: return
    n = len(text)
    for k, ch in enumerate(text):
        t = t0 + write * (k + 1) / n
        if ch == " ": put(space, t, gain - 4)
        else: put(key * (0.8 + 0.4 * rng.random()), t + rng.normal(0, 0.004), gain + rng.normal(0, 1.2))

env = np.zeros(len(bed), np.float32); T = np.arange(len(bed)) / SR
def level(a, b, db, ramp=0.4):
    """an ambience level between two moments, for ambience(); louder of the overlapping levels wins"""
    m = (T >= a - ramp) & (T < b + ramp); w = np.clip(np.minimum((T - (a - ramp)) / ramp, ((b + ramp) - T) / ramp), 0, 1)
    env[m] = np.maximum(env[m], (10 ** (db / 20)) * w[m])
def ambience(name, af=None, peak=0.5):
    """lay one looped atmosphere under the whole film, shaped by the level() calls before it"""
    global bed
    a = norm(load(name, af), peak); bed += np.tile(a, int(np.ceil(len(bed) / len(a))))[: len(bed)] * env
def one(name, start=0.0, length=None, af=None, peak=0.9):
    x = load(name, af); x = onset(x) if start == 0.0 else x[int(start * SR):]
    return norm(trim(x, 0, length, 0.03) if length else x, peak)
def bedloop(name, a, b, db, af=None, fade=0.4):
    """a recorded atmosphere under one shot: looped to fit, faded in and out"""
    x = load(name, af); n = int((b - a + 2 * fade) * SR); x = np.tile(x, int(np.ceil(n / len(x))))[:n]
    f = int(fade * SR); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f); put(norm(x, 0.6), a - fade, db)
class Yok(dict):
    def __missing__(self, k): raise SystemExit(f"HATA: efektler.py '{k}' çekimini istiyor ama filmde yok. Filmdeki çekimler: {sorted(SHOTS)}")
SHOTS = Yok(SHOTS)
A = lambda k: SHOTS[k][0]; B = lambda k: SHOTS[k][1]; S = A

for a, b, text in LINES: typing(text, a, min(1.6, (b - a) * 0.45))   # the narration's captions
if fx: exec(open(fx, encoding="utf-8").read(), globals())
else: print("Not: efektler.py verilmedi, yatak sadece daktilo sesi.")

# no dead clicks: a gentle limiter, then write 48 kHz stereo
peak = np.max(np.abs(bed)); bed = np.tanh(bed * 1.2) / np.tanh(1.2) if peak > 0.98 else bed
stereo = np.stack([bed, bed], 1)[: int(DUR * SR)]
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", out], input=stereo.astype(np.float32).tobytes(), check=True)
print("bed", out, f"{DUR:.1f}s", "peak", round(float(np.max(np.abs(stereo))), 3))
