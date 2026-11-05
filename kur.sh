#!/usr/bin/env bash
# Animasyon Stüdyosu kurulumu. Depoyu indirdiğin klasörde çalıştır:
#   bash kur.sh            skill + anidoodle motoru
#   bash kur.sh --ses      ayrıca seslendirme araçları (faster-whisper, librosa; ~650 MB)
#   bash kur.sh --guncelle kurulu skill'i bu sürümle değiştirir (zevk profili ve sayfalar dosyan korunur)
# anidoodle orijinal deposundan indirilir: https://github.com/alexgreensh/anidoodle (Apache-2.0)
set -euo pipefail
SES=0; GUNCELLE=0
for a in "$@"; do case "$a" in --ses) SES=1;; --guncelle) GUNCELLE=1;; *) echo "bilinmeyen seçenek: $a"; exit 2;; esac; done
HERE="$(cd "$(dirname "$0")" && pwd)"; SKILLS="$HOME/.claude/skills"; ARAC="${ARACLAR:-$HOME/araclar}"
eksik=""; for c in git node npm ffmpeg ffprobe; do command -v "$c" >/dev/null || eksik="$eksik $c"; done
# Windows's python3 can be a Store shortcut that runs nothing: keep the first one that really starts
PY=""; for c in python python3 py; do if command -v "$c" >/dev/null && "$c" -c "import sys" >/dev/null 2>&1; then PY="$c"; break; fi; done
[ -n "$PY" ] || eksik="$eksik python"
[ -z "$eksik" ] || { echo "Önce bunları kur:$eksik"; exit 1; }
mkdir -p "$SKILLS"

echo "1/3 Animasyon Stüdyosu skill'i"
D="$SKILLS/animasyon-studyosu"
if [ -e "$D" ] && [ "$GUNCELLE" = 0 ]; then echo "  zaten kurulu, geçildi (değiştirmek için --guncelle)"
else
  K="$(mktemp -d)"
  for f in references/zevk-profili.md references/sayfalar.md; do [ -f "$D/$f" ] && { mkdir -p "$K/references"; cp "$D/$f" "$K/$f"; }; done
  rm -rf "$D"; cp -r "$HERE/animasyon-studyosu" "$D"
  [ -d "$K/references" ] && cp "$K/references/"* "$D/references/"
  rm -rf "$K"; echo "  kuruldu: $D"
fi

echo "2/3 anidoodle motoru"
A="$SKILLS/anidoodle"
if [ -d "$A/engine" ]; then echo "  zaten kurulu, geçildi"
else
  T="$(mktemp -d)"; git clone -q --depth 1 https://github.com/alexgreensh/anidoodle.git "$T/a"
  cp -r "$T/a/skills/anidoodle" "$A"; cp "$T/a/LICENSE" "$T/a/NOTICE" "$A/"; rm -rf "$T"
  echo "  indirildi: $A"
fi
if [ ! -d "$A/engine/node_modules" ]; then (cd "$A/engine" && npm install --omit=optional --no-audit --no-fund --silent); fi
(cd "$A/engine" && npx --no-install playwright-core install chromium >/dev/null)
echo "  motor hazır"

echo "3/3 ses araçları"
if [ "$SES" = 1 ]; then
  mkdir -p "$ARAC"; [ -d "$ARAC/venv" ] || "$PY" -m venv "$ARAC/venv"
  VP="$ARAC/venv/Scripts/python.exe"; [ -x "$VP" ] || VP="$ARAC/venv/bin/python"
  "$VP" -m pip install -q --disable-pip-version-check --default-timeout=120 faster-whisper numpy librosa
  echo "  kuruldu: $ARAC/venv"
else echo "  geçildi (kendi sesini oturtacaksan: bash kur.sh --ses)"; fi

echo
echo "Hazır. Claude Code'u yeniden aç ve yaz: yeni bir video yapalım"
