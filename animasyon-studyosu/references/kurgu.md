# Kurgu ve teslim (ffmpeg / Python / HyperFrames)

Araçlar: ffmpeg (winget), Python venv `~/araclar/venv` (numpy, librosa, torch CUDA,
demucs, yt-dlp, instaloader, trafilatura, faster-whisper), sistem `python` (opencv 4.10: takip,
phaseCorrelate, maske; venv'de opencv YOK), Real-ESRGAN
(`~/araclar/realesrgan/realesrgan-ncnn-vulkan.exe`, GPU büyütme).

## Ne zaman hangisi
- **Python + ffmpeg betiği** (varsayılan): klip birleştirme, maske geçişleri, logo bindirme, ses
  zaman çizelgesi. Her sürümü ayrı betik/çıktı adıyla sakla (`v8.py` → `..._v8.mp4`), geri dönülebilsin.
- **HyperFrames** (`hyperframes` skill'i, proje örneği (örnek proje)): HTML ile
  grafik/metin ağırlıklı kurgu, varyant üretimi (A/B/C), hazır blok kataloğu. Render ~35 sn.
- **Kodla film** (anidoodle): çizim/animasyonun kendisi. Bkz. `kodla-film.md`.

## Kesme ve geçiş
- Müzikli işlerde kesmeler müziğin vuruşlarına (librosa percussive onset). Whoosh efektli
  geçişler amatör bulundu.
- Eşleşen hareketle geçiş: iki klipte hız ve konum eşleşen karede bindirme (bkz. ai-video.md).
- Maske geçişi (ör. yerden yukarı 20 kare) kliplerin hizası tutuyorsa güzel çalışır.
- Kapanış kartı: görüntü akarken flu + sıcak karartma, logo büyüyerek; slogan/çizgi bazen fazla
  bulundu (bir işte kaldırıldı).

## Logo
- Kurguda yapıştırılan logo titrer ve sahneden ayrı durur. Hareketli yüzeyde gerekiyorsa: polyfit ile
  yumuşatılmış takip + `warpAffine` alt-piksel + yüzeyin dokusu (multiply). En iyisi görüntüye
  üretim aşamasında işlemek.
- sayfa çizim videolarında logo kdKit ile (sulu boya, altta).

## Ses
- Her klip: loudnorm + hafif kompresör (Veo klipleri için; kullanıcının KENDİ sesine değil).
- Klip arası 1,6 sn çapraz geçiş; sessiz kalan uzatma eklerini önceki sesle doldur.
- Teslim -14 LUFS (`scripts/birlestir.sh` ya da `loudnorm`), AAC 256k, `+faststart`.

## Kontrol
- Kontak sayfası: `ffmpeg -i v.mp4 -vf "fps=2,scale=270:-1,tile=8x4" sheet.png`
- Belirli an: `ffmpeg -ss 12.3 -i v.mp4 -frames:v 1 kare.png`
- Ses seviyesi: `ffmpeg -i v.mp4 -af ebur128 -f null - 2>&1 | grep "I:"`
- Sessizlik bul: `ffmpeg -i v.mp4 -af silencedetect=n=-50dB:d=0.3 -f null -`
- Teslimde: süre, LUFS, kontrol edilen anlar, kontrol edilemeyenler.
