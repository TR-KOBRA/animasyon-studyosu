#!/usr/bin/env bash
# Ara kare üretir (RIFE; -g 1 ikinci ekran kartını seçer, kendi makinene göre değiştir): akıcılaştırma ve ağır çekim.
#   bash ara_kare.sh <girdi.mp4> <cikti.mp4> [hedef_fps=30] [yavaslatma=1]
#   Veo 24 fps -> 30 fps: bash ara_kare.sh k.mp4 k30.mp4        2x ağır çekim: bash ara_kare.sh k.mp4 yavas.mp4 30 2
# Kareler 2 katına çıkar, sonra hedefe indirilir; ses korunmaz (yavaşlatınca bozulur), kurguda eklenir.
# Sınır: hızlı akan arka planda ve üst üste geçen nesnede ara kare bulanıklaşır/hayaletlenir; sonucu kare kare bak.
# Çizim animasyonlarında kullanma: çizgi eriyip el yapımı hissi gider.
set -euo pipefail
I="$1"; O="$2"; FPS="${3:-30}"; SLOW="${4:-1}"
R="${ARACLAR:-$HOME/araclar}"/rife/rife-ncnn-vulkan-20221029-windows
T="$(mktemp -d)"; mkdir "$T/a" "$T/b"
SRC=$(ffprobe -v error -select_streams v -show_entries stream=r_frame_rate -of csv=p=0 "$I")
ffmpeg -v error -y -i "$I" "$T/a/%08d.png"
"$R/rife-ncnn-vulkan.exe" -i "$T/a" -o "$T/b" -m "$R/rife-v4.6" -g 1 -f %08d.png >/dev/null 2>&1
RATE=$(python -c "from fractions import Fraction as F; print(float(F('$SRC')*2/$SLOW))")
ffmpeg -v error -y -framerate "$RATE" -i "$T/b/%08d.png" -vf "fps=$FPS" -c:v libx264 -crf 16 -pix_fmt yuv420p -movflags +faststart "$O"
rm -rf "$T"; echo "hazır: $O"
