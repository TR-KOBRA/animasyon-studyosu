#!/usr/bin/env bash
# Aday tarzları yan yana, Türkçe etiketli TEK görselde gösterir (kullanıcıya tarz seçtirmek için).
#   bash tarz_onizleme.sh <cikti.png> <anahtar>[=Etiket] <anahtar>[=Etiket] ...
#   ör: bash tarz_onizleme.sh /tmp/tarz.png wren="Mürekkep-laviş" isometric="İzometrik kesit" lowPoly="Low-poly 3D"
# Örnek filmler bir proje kopyasından çizilir (motorun kendi klasörüne yazmaz): TARZ_PROJE, yoksa ilk $HOME/*_anim/film.
set -euo pipefail
OUT="$1"; shift; PROJ="${TARZ_PROJE:-$(ls -d "$HOME"/*_anim/film 2>/dev/null | head -1)}"; [ -n "$PROJ" ] || { echo "hiç proje yok: önce yeni_proje.sh ile bir proje kur"; exit 2; }

TMP="$(mktemp -d)"
declare -A FILM=([storybook]=storybookDraw [kinetic]=kineticDemo)
i=0; INPUTS=(); FILT=""
for a in "$@"; do
  k="${a%%=*}"; lab="${a#*=}"; [ "$lab" = "$a" ] && lab="$k"; f="${FILM[$k]:-$k}"
  [ -f "$PROJ/src/hosts/page-$f.ts" ] || { echo "örnek film yok: $f"; exit 2; }
  # the finished picture: many example films draw themselves, so their first frame is blank; take the last one
  last=$(cd "$PROJ" && node tools/still.mjs "$f" --frame 99999999 --scale 0.2 --out "$TMP/probe.png" 2>&1 | grep -oE 'last frame [0-9]+' | grep -oE '[0-9]+' | head -1 || true); [ -n "$last" ] || last=0
  (cd "$PROJ" && node tools/still.mjs "$f" --frame "$last" --scale 0.5 --out "$TMP/$i.png" >/dev/null)
  printf '%s' "$((i+1)). $lab" > "$TMP/$i.txt"
  INPUTS+=(-i "$i.png")
  FILT+="[$i]scale=-1:640,pad=iw:ih+60:0:0:white,drawtext=fontfile='C\:/Windows/Fonts/arialbd.ttf':textfile=$i.txt:fontsize=30:fontcolor=black:x=(w-tw)/2:y=h-46[v$i];"
  i=$((i+1))
done
for ((j=0;j<i;j++)); do FILT+="[v$j]"; done
OUTA="$(cd "$(dirname "$OUT")" && pwd)/$(basename "$OUT")"
(cd "$TMP" && ffmpeg -v error -y "${INPUTS[@]}" -filter_complex "${FILT}$([ "$i" -gt 1 ] && echo "hstack=inputs=$i" || echo null)" "$OUTA")
echo "hazır: $OUT"
