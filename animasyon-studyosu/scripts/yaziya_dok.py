"""Transcribe the narration with word timestamps (faster-whisper, CPU int8; the GPU lacks cuBLAS here).
usage: python -I yaziya_dok.py <audio> <out.json> [--sozluk "özel adlar, virgülle"] [--model medium]
Özel adları sözlüğe yaz: whisper yanlış duymasın. Çıktının yanına kelimeler.txt yazar (sıra numarası, başlangıç, bitiş, güven, kelime).
"""
import json, os, sys
from faster_whisper import WhisperModel

audio, out = sys.argv[1], sys.argv[2]
sys.stdout.reconfigure(encoding="utf-8")
def opt(n, d): return sys.argv[sys.argv.index(n) + 1] if n in sys.argv else d
model = WhisperModel(opt("--model", "medium"), device="cpu", compute_type="int8")
segs, info = model.transcribe(audio, language="tr", word_timestamps=True, vad_filter=False, beam_size=5,
                              initial_prompt=opt("--sozluk", None))
words, text = [], []
for s in segs:
    text.append(s.text.strip())
    for w in s.words: words.append({"w": w.word.strip(), "a": round(w.start, 3), "b": round(w.end, 3), "p": round(w.probability, 3)})
json.dump({"text": " ".join(text), "words": words}, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(" ".join(text)); print(len(words), "words")
open(os.path.splitext(out)[0] + ".txt", "w", encoding="utf-8").write("".join(f"{i:3d} {w['a']:7.2f} {w['b']:7.2f} {w['p']:.2f} {w['w']}\n" for i, w in enumerate(words)))
