"""Fit the film to the narrator's recording.

1. Shorten the recording's long silences and long breaths, and nothing else: no word is removed, no
   word is trimmed (each keeps 150 ms after it and 80 ms before it, and its fading tail), no denoising,
   no compression. The narrator's performance is left as it was spoken.
2. Write voice.wav and every word's new time.
3. Rewrite the film's LINES (captions, in the corrected spelling) and SHOTS (one picture per phrase,
   each cut a hair before its first word) and DURATION in the film file, so pictures, captions and the
   typewriter clicks all follow the voice.

usage: python -I seslendirme_oturt.py <ham.wav> <kelimeler.json> <film .ts> <ses_kurgu.wav> <kurgu.py>
kurgu.py holds this recording's CAPS, SHOT_AT, optional DROP and KAPANIS (see kurgu_ornegi.py).
"""
import json, re, subprocess, sys, numpy as np

SR = 48000
wav, wj, ts_path, out = sys.argv[1:5]
sys.stdout.reconfigure(encoding="utf-8")
def die(m): print("HATA:", m); sys.exit(1)
if len(sys.argv) < 6: die("kurgu.py gerekli (CAPS, SHOT_AT): bkz. kurgu_ornegi.py")
CFG = {}
exec(open(sys.argv[5], encoding="utf-8").read(), CFG)   # this recording's CAPS, SHOT_AT, DROP, KAPANIS
for k in ("CAPS", "SHOT_AT"):
    if not CFG.get(k): die(f"kurgu.py içinde {k} yok")
W = json.load(open(wj, encoding="utf-8"))["words"]
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", wav, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.float32)

LEAD = 0.25
DROP = CFG.get("DROP", set())
KAPANIS = CFG.get("KAPANIS", 1.75)   # seconds kept after the last word for the closing (kdKit's close is 52 frames)
# only the room between words is touched. For each pair of neighbouring words the cut region starts
# 150 ms after the first word's end (later still while the word's tail is above -38 dBFS) and stops
# 80 ms before the next word's start (earlier while an onset is already rising); if that region is
# longer than the pause wanted there, its middle is taken out with a 15 ms crossfade.
hop = int(0.01 * SR); nfr = len(x) // hop
db = 20 * np.log10(np.sqrt(np.mean(x[: nfr * hop].reshape(nfr, hop) ** 2, axis=1)) + 1e-9)
fr = lambda t: min(nfr - 1, max(0, int(t * 100)))
cuts = []   # (start, end) of original audio removed
for i in range(len(W) - 1):
    a = W[i]["b"] + 0.15; b = W[i + 1]["a"] - 0.08
    while fr(a) < fr(b) and db[fr(a)] > -38: a += 0.01   # let the tail die away
    while fr(b) > fr(a) and db[fr(b)] > -38: b -= 0.01   # do not touch a rising onset
    w = W[i]["w"]; want = 0.30 if w.endswith((".", "?", "!")) else (0.18 if w.endswith(",") else 0.10)
    if b - a > want + 0.05:
        m = (a + b) / 2; cuts.append((m - (b - a - want) / 2, m + (b - a - want) / 2))
# the lead-in before the first word, down to a quarter second
if W[0]["a"] - 0.08 > LEAD: cuts.insert(0, (0.0, W[0]["a"] - 0.08 - LEAD))
xf = int(0.015 * SR); parts, prev = [], 0.0
for c0, c1 in cuts: parts.append((prev, c0)); prev = c1
# a dropped sign-off at the end: the voice stops half a second after the last kept word
last_kept = max(k for k in range(len(W)) if k not in DROP)
parts.append((prev, min(len(x) / SR, W[last_kept]["b"] + 0.5)))
outv = np.zeros(0, np.float32); starts = []
for a0, b0 in parts:
    p = x[int(a0 * SR): int(b0 * SR)].copy(); starts.append((a0, b0, len(outv) / SR))
    if len(outv) >= xf and len(p) >= xf:
        ramp = np.linspace(0, 1, xf, dtype=np.float32); p[:xf] = outv[-xf:] * (1 - ramp) + p[:xf] * ramp; outv = outv[:-xf]
        starts[-1] = (a0, b0, len(outv) / SR)
    outv = np.concatenate([outv, p])
total = len(outv) / SR
def remap(u):
    """an original time -> its time in the shortened voice (a moment inside a removed stretch goes to its edge)"""
    for a0, b0, n0 in starts:
        if u < a0: return n0
        if u <= b0: return n0 + (u - a0)
    return total
newt = {i: (remap(W[i]["a"]), remap(W[i]["b"])) for i in range(len(W))}
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", out], input=outv.astype(np.float32).tobytes(), check=True)

# captions: the words as spoken, spelled right; each runs from its first word to just after its last
CAPS = CFG["CAPS"]
bad = [c for c in CAPS if c[0] > c[1] or c[1] >= len(W)]
if bad: die(f"CAPS kelime sırası kayıtta yok (kayıtta {len(W)} kelime var, 0-{len(W) - 1}): {bad[:3]}")
first = lambda i: newt[min(k for k in newt if k >= i)][0]
last = lambda i: newt[max(k for k in newt if k <= i)][1]
lines = [(round(first(a), 2), round(last(b) + 0.15, 2), txt) for a, b, txt in CAPS]
# one picture per phrase: the shot starts 0.12 s before its first word (the cut leads the voice)
SHOT_AT = CFG["SHOT_AT"]
if any(i is not None and i >= len(W) for _, i in SHOT_AT): die(f"SHOT_AT kelime sırası kayıtta yok (0-{len(W) - 1})")
starts = []
for k, i in SHOT_AT:
    if i is None: starts.append((k, 0.0))
    else: starts.append((k, round(max(0.0, first(i) - 0.12), 2)))
end = round(total + KAPANIS, 2)
shots = [(k, a, starts[n + 1][1] if n + 1 < len(starts) else end) for n, (k, a) in enumerate(starts)]

ts = open(ts_path, encoding="utf-8").read()
missing = [k for k, _, _ in shots if f'"{k}"' not in ts.split("const SHOTS", 1)[-1].split("];", 1)[-1]]
if missing: print("UYARI: filmde çizimi olmayan çekimler (son çekime düşer):", missing)
def sub(pat, rep, name):
    global ts
    ts, n = re.subn(pat, rep, ts, count=1, flags=re.S)
    if n != 1: die(f"film dosyasında {name} bulunamadı, hiçbir şey yazılmadı")
sub(r"(const LINES: [^=]+= \[).*?\n\];\n", lambda m: m.group(1) + "\n" + "\n".join(f'  [{a}, {b}, "{t}"],' for a, b, t in lines) + "\n];\n", "LINES")
sub(r"(const SHOTS: Shot\[\] = \[).*?\n\];\n", lambda m: m.group(1) + "\n" + "\n".join(f'  {{ a: {a}, b: {b}, k: "{k}" }},' for k, a, b in shots) + "\n];\n", "SHOTS")
fps = int(re.search(r"const FPS = (\d+)", ts).group(1))
sub(r"(const FPS = \d+, DURATION = )\d+", lambda m: m.group(1) + str(int(round(end * fps))), "DURATION")
open(ts_path, "w", encoding="utf-8").write(ts)
print(f"voice {out}: {total:.1f}s (recording was {len(x) / SR:.1f}s); film {end:.1f}s; {len(lines)} captions, {len(shots)} shots")
print("short shots:", [(k, round(b - a, 2)) for k, a, b in shots if b - a < 0.8])
