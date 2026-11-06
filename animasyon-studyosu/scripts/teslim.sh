#!/usr/bin/env bash
# Bitmiş işi sayfanın teslim klasörlerine koyar. Masaüstüne tek tek dosya bırakmaz.
#   bash teslim.sh "<sayfa ya da iş adı>" --video final.mp4 --kapak kapak.jpg
# Video:  <Masaüstü>/<ad> stok/        Kapak:  <Masaüstü>/<ad> stok kapak/
# Klasör yoksa açar; aynı adda klasör varsa (büyük harf ve fazladan boşluk fark etmez) onu kullanır.
# Başka yer için: TESLIM_KOK=/yol/klasor bash teslim.sh ...
set -euo pipefail
[ $# -ge 3 ] || { echo 'Kullanım: bash teslim.sh "<ad>" --video final.mp4 [--kapak kapak.jpg]'; exit 1; }
AD="$1"; shift; VIDEO=""; KAPAK=""
while [ $# -gt 0 ]; do
  case "$1" in
    --video) VIDEO="$2"; shift 2 ;;
    --kapak) KAPAK="$2"; shift 2 ;;
    *) echo "bilinmeyen seçenek: $1"; exit 1 ;;
  esac
done
KOK="${TESLIM_KOK:-}"
if [ -z "$KOK" ]; then
  for d in "$HOME/Desktop" "$HOME/OneDrive/Desktop" "$HOME/OneDrive/Masaüstü" "$HOME/Masaüstü"; do
    [ -d "$d" ] && { KOK="$d"; break; }
  done
fi
[ -n "$KOK" ] || { echo "HATA: masaüstü bulunamadı, TESLIM_KOK ver."; exit 1; }
sade() { echo "$1" | tr -s ' ' | tr '[:upper:]' '[:lower:]'; }
klasor() {
  local istenen="$1" d
  for d in "$KOK"/*/; do
    [ -d "$d" ] || continue
    d="${d%/}"
    if [ "$(sade "$(basename "$d")")" = "$(sade "$istenen")" ]; then echo "$d"; return; fi
  done
  mkdir -p "$KOK/$istenen"; echo "$KOK/$istenen"
}
koy() {
  local dosya="$1" hedef
  [ -f "$dosya" ] || { echo "HATA: dosya yok: $dosya"; exit 1; }
  hedef="$(klasor "$2")"; cp "$dosya" "$hedef/"; echo "kondu: $hedef/$(basename "$dosya")"
}
[ -z "$VIDEO" ] || koy "$VIDEO" "$AD stok"
[ -z "$KAPAK" ] || koy "$KAPAK" "$AD stok kapak"
