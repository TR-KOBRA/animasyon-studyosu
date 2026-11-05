#!/usr/bin/env bash
# Sessiz render + ses karışımı -> teslim MP4. Ses düz kazançla -14 LUFS'a getirilir (sıkıştırma yok),
# videonun sonuna kadar uzatılır (kapanışta ses son 1,6 sn'de söner).
#   bash birlestir.sh <sessiz.mp4> <mix.wav> <cikti.mp4> [sonme_sn=1.6]
# DİKKAT: son konuşma bu sönme başlamadan bitmeli (vize parodisinde son replik söndü, duyulmadı).
# Sönme istemiyorsan 4. argüman 0.
set -euo pipefail
V="$1"; A="$2"; O="$3"; F="${4:-1.6}"
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$V")
AD=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$A")
# a mix longer than the picture would be cut off silently: the render is out of date
python -c "import sys; sys.exit(0 if $AD <= $D + 0.1 else 1)" || { echo "HATA: ses ${AD} sn, video ${D} sn. Ses kesilirdi: seslendirme_oturt.py sonrası render'ı yenile."; exit 1; }
E=$(ffmpeg -hide_banner -nostats -i "$A" -af ebur128=peak=true -f null - 2>&1 | tail -14)
I=$(echo "$E" | grep -E '^\s+I:' | awk '{print $2}'); TP=$(echo "$E" | grep -E '^\s+Peak:' | awk '{print $2}')
# flat gain toward -14 LUFS, but never past -1 dBTP: no compressor or limiter touches the voice
G=$(python -c "print(round(min(-14-($I),-1.05-($TP)),2))")
FS=$(python -c "print(max(0,$D-$F))")
FADE=""; [ "$F" = "0" ] || FADE="afade=t=out:st=${FS}:d=${F},"
ffmpeg -v error -y -i "$V" -i "$A" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -af "volume=${G}dB,${FADE}apad" -t "$D" -movflags +faststart "$O"
echo "çıktı: $O  süre ${D}s  kazanç ${G} dB"
ffmpeg -hide_banner -i "$O" -af ebur128 -f null - 2>&1 | grep -E '^\s+I:' | tail -1
