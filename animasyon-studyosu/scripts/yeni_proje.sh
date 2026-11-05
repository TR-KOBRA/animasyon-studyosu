#!/usr/bin/env bash
# Yeni bir kodla-animasyon projesi kurar (anidoodle motoru + sayfa kiti + ses araçları).
#
#   bash yeni_proje.sh <film_adi> [klasor] --tarz <anahtar>
#   tarz: kullanıcının SEÇTİĞİ çizim tekniği (references/tarzlar.md). Varsayılan yok: sormadan kurma.
#         Fırça/boya tarzları (wren, ranunculus, folkTale, sumiE...) mürekkep damlası açılış + suluboya logo alır,
#         diğerleri (flatVector, isometric, koi, lowPoly...) yumuşak geçiş + logonun kendisi.
#   film_adi: ASCII, harfle başlar, boşluksuz (ör. obruk, alaaddin, catalhoyuk)
#   klasor:   varsayılan $HOME/<film_adi>_anim   (yol ASCII olmalı: Türkçe karakter araçları bozar)
#
# Sonuç: <klasor>/film  (motor, node_modules dahil, kopyalanır; internet gerekmez)
#        <klasor>/film/src/canvas-core/<film_adi>.ts  başlangıç filmi (iki örnek çekim, logo, açılış, kapanış)
#        <klasor>/film/tools/*.py  ses araçları,  <klasor>/MOTION_RULES.md
set -euo pipefail
TARZ=""; ARGS=()
while [ $# -gt 0 ]; do case "$1" in --tarz) TARZ="${2:-}"; shift 2;; *) ARGS+=("$1"); shift;; esac; done
AD="${ARGS[0]:?film adı gerekli}"; DIR="${ARGS[1]:-$HOME/${AD}_anim}"
if printf %s "$DIR" | LC_ALL=C grep -q '[^ -~]'; then echo "klasör yolu ASCII olmalı (Türkçe karakter araçları bozuyor): $DIR"; exit 2; fi
ENGC="$HOME/.claude/skills/anidoodle/engine/src/canvas-core"
[ -n "$TARZ" ] || { echo "--tarz gerekli (kullanıcıya seçtir). Seçenekler: wren ranunculus storybookDraw folkTale sumiE charcoalErasure colouredPencil pocketWatch flatVector isometric koi rubberHose fox paperCraft halftone lighthouse pixelArt blueprint moonPhases lowPoly woodcut mellan stipple scratchboard paintedOil brokenColour midCentury toyBrick embroidery dreamGlaze balloon scrapbook"; exit 2; }
[ -f "$ENGC/$TARZ.ts" ] || { echo "bilinmeyen tarz: $TARZ ($ENGC/$TARZ.ts yok)"; exit 2; }
[[ "$AD" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || { echo "film adı ASCII harf/rakam/alt çizgi olmalı: $AD"; exit 2; }
SK="$(cd "$(dirname "$0")/.." && pwd)"; ENG="$HOME/.claude/skills/anidoodle/engine"
[ -d "$ENG" ] || { echo "anidoodle motoru yok: $ENG"; exit 2; }
[ -e "$DIR/film" ] && { echo "zaten var: $DIR/film (üzerine yazmıyorum)"; exit 2; }
mkdir -p "$DIR"
cp -r "$ENG" "$DIR/film"
rm -rf "$DIR/film/dist" "$DIR/film/out" "$DIR/film/.tmp"; mkdir -p "$DIR/film/out" "$DIR/film/assets"
C="$DIR/film/src/canvas-core"
cp "$SK/assets/sablon/gokWorld.ts" "$SK/assets/sablon/kdKit.ts" "$C/"
sed -e "s/__AD__/$AD/g" -e "s/__TARZ__/$TARZ/g" "$SK/assets/sablon/sablon.ts" > "$C/$AD.ts"
if ! ls "$SK/assets/sablon/"logo_*.png >/dev/null 2>&1; then sed -i -e 's/const K = kit(PAINTED ? { fps: FPS, duration: DURATION } : { fps: FPS, duration: DURATION, opening: "fade", closing: "fade", logo: { style: "plain" }, caption: "clean" });/const K = kit(PAINTED ? { fps: FPS, duration: DURATION, logo: false } : { fps: FPS, duration: DURATION, opening: "fade", closing: "fade", logo: false, caption: "clean" });/' "$C/$AD.ts"; fi
printf 'import { %s } from "../canvas-core/%s";\nimport { mountFilm } from "./page";\nmountFilm(%s);\n' "$AD" "$AD" "$AD" > "$DIR/film/src/hosts/page-$AD.ts"
cp "$SK/assets/sablon/"logo_*.png "$DIR/film/assets/" 2>/dev/null || echo "not: logo yok; film/assets/logo_renkli.png ve logo_beyaz.png koy ya da kit({ logo: false }) kullan"
cp "$SK/scripts/"*.py "$SK/scripts/birlestir.sh" "$SK/scripts/agiz_senkron.sh" "$SK/scripts/ara_kare.sh" "$DIR/film/tools/"
[ -f "$SK/assets/sablon/MOTION_RULES.md" ] && cp "$SK/assets/sablon/MOTION_RULES.md" "$DIR/"
[ -e "$DIR/BRIF.md" ] || cp "$SK/assets/brif_sablonu.md" "$DIR/BRIF.md"
[ -e "$DIR/SAHNELER.md" ] || cp "$SK/assets/sahne_listesi_sablonu.md" "$DIR/SAHNELER.md"
mkdir -p "$DIR/kayit" "$DIR/ses"
printf '# Bu kaydın kurgusu. Kelime numaraları kelimeler.txt içinden; örnek: tools/kurgu_ornegi.py\nDROP = set()      # sadece kullanıcının onayladığı silinecek kelimeler\nCAPS = []         # (ilk_kelime, son_kelime, "ALTYAZI METNİ")\nSHOT_AT = []      # ("çekim_adı", ilk_kelime) ; ilk çekim ("ad", None)\nKAPANIS = 1.75    # son sözden sonra kapanış süresi (sn)\n' > "$DIR/kayit/kurgu.py"
printf '# Bu filmin efektleri; örnek: tools/efekt_ornegi.py\n# put(one("dosya.ogg", 0.0, 1.0), A("cekim") + 0.5, -10)\n' > "$DIR/kayit/efektler.py"
echo "hazır: $DIR/film  (film: $AD, tarz: $TARZ; tarzın fırçaları: src/canvas-core/$TARZ.ts)"
echo "deneme karesi: cd \"$DIR/film\" && node tools/still.mjs $AD --frames 60 --scale 1 --out out/deneme.png"
