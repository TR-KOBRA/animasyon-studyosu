#!/usr/bin/env bash
# Sesten çizgi film ağız zamanlaması çıkarır (Rhubarb, Türkçe için dilden bağımsız "phonetic" tanıyıcı).
#   bash agiz_senkron.sh <ses> <cikti.json>
# Çıktı: { mouthCues: [{start, end, value}] }; value A-H ve X (X kapalı). Filmde: kdKit mouthAt(cues, sn).
# Sadece konuşan ses ver: müzik varsa önce demucs ile vokali ayır.
set -euo pipefail
RH="${ARACLAR:-$HOME/araclar}"/rhubarb/Rhubarb-Lip-Sync-1.14.0-Windows/rhubarb.exe
T="$(mktemp -d)"; ffmpeg -v error -y -i "$1" -vn -ac 1 -ar 16000 "$T/s.wav"
"$RH" -q -r phonetic -f json -o "$2" "$T/s.wav"
echo "hazır: $2"
