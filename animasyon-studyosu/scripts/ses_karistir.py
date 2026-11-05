"""Lay the narrator's voice over the sound bed. The voice goes in exactly as recorded (no denoise, no
compression, no EQ); only the bed ducks under it (up to -45 %, following the voice's own envelope).

usage: python -I ses_karistir.py <bed.wav (sesmiks.py)> <voice.wav (seslendirme_oturt.py)> <out.wav>
"""
import subprocess, sys, numpy as np

SR = 48000
bedf, voicef, out = sys.argv[1:4]
def L(p, ch): return np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", str(ch), "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout, np.float32).reshape(-1, ch)
bed = L(bedf, 2); v = L(voicef, 1)[:, 0]
N = max(len(bed), len(v)); bed = np.pad(bed, ((0, N - len(bed)), (0, 0))); v = np.pad(v, (0, N - len(v)))
k = SR // 20; env = np.sqrt(np.convolve(v ** 2, np.ones(k) / k, mode="same")); duck = 1 - 0.45 * np.clip(env / (np.percentile(env, 95) + 1e-9), 0, 1)
mix = bed * duck[:, None] * 0.9 + np.stack([v, v], 1)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", out], input=mix.astype(np.float32).tobytes(), check=True)
print("mix", round(N / SR, 1), "s, peak", round(float(np.abs(mix).max()), 3))
