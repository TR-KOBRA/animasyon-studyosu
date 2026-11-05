# Tarz kataloğu: kullanıcıya seçenek sun

Tarz bir varsayılan DEĞİLDİR: her yeni işte kullanıcıya seçtir. örnek filmin mürekkep+laviş dili
seçeneklerden yalnızca biri (bir belgesel tipi için onaylı hazır ayar). sayfa belgesel
serisinde ilk öneri odur, seri dili tutarlı kalsın diye; yine
de seçenekli sorulur. Konu belli bir dünyaya aitse (bir parodi) o dünyanın dilini kullan,
sayfanın eski şablonunu kopyalama: kullanıcı "önceki formatı birebir kopyalamışsın" diye reddetti.

## Nasıl seçtirilir
1. Konuya ve tona göre 3 aday seç (aşağıdaki "en iyi olduğu iş" sütunu), önerini ilk sıraya koy,
   her birine bir cümlelik gerekçe yaz. AskUserQuestion ile sor (seçeneklerde kısa tarif).
2. Görsel göster: adayları yan yana, Türkçe etiketli tek görselde çıkar ve gönder:
   `bash scripts/tarz_onizleme.sh <scratchpad>/tarz.png wren="Mürekkep-laviş" isometric="İzometrik kesit" lowPoly="Low-poly 3D"`
   (anahtarlar aşağıdaki tablolarda; motor klasörüne yazmaz). Anidoodle'ın 32 tarzlık galerisi
   `~/.claude/skills/anidoodle/assets/styles.jpg` kullanıcı hepsini görmek isterse (İngilizce etiketli).
   Three.js, Blender, Flow ve karikatürde önizleme filmi yok: geçmiş işten kare göster ya da tarif et.
3. Seçilen tarzı konunun kendi sahnesiyle TEK karede kanıtla, onay al, sonra tüm filme geç.
4. Karma da olur (en fazla iki dil): bkz. aşağıdaki "Karma tarifleri".

## A · Elle çizim görünümü (anidoodle motoru, `yeni_proje.sh --tarz <anahtar>`)

| Tarz | Anahtar (örnek film) | Görünüm | En iyi olduğu iş |
|---|---|---|---|
| Mürekkep + laviş | `wren` | ıslak laviş + esnek uç kontur | duygusal yerel belgesel, anı, mekân hikâyesi (**örnek film: hazır ayar `tarz-murekkep-lavis.md`**) |
| Kurşun kalem + suluboya | `ranunculus`, `storybookDraw` | grafit üstüne açık suluboya | doğa, tarih, sakin anlatım |
| Masal kitabı guaj | `folkTale` | guaj ön plan, uzakta çıplak kalem | efsane, Nasreddin Hoca, çocuklara masal |
| Sumi-e mürekkep | `sumiE` | tek fırça, beş ton mürekkep | sade, şiirsel, manzara |
| Kömür kalem | `charcoalErasure` | silinip yeniden çizilen kömür | dramatik tarih, savaş/afet yıldönümü (şiddet çizmeden) |
| Renkli kalem | `colouredPencil` | tek yön tarama, katmanlı renk | sıcak, samimi, okul/çocukluk |
| Tükenmez kalem eskiz | `pocketWatch` | mavi tükenmez tarama | defter/öğrenci temalı, mizahi not |
| Gravür / nokta / kazıma | `mellan`, `stipple`, `scratchboard` | tek çizgi, nokta, kazıma | eski belge, tarih, arşiv havası |
| Ukiyo-e baskı | `woodcut` | düz renk blokları | stilize tarih, poster etkisi |
| Yağlı boya | `paintedOil`, `brokenColour` | kalın fırça | sanat, müze, Mevlana müzesi gibi mekânlar (figürler yüzsüz) |

## B · Düz 2D / grafik (anidoodle ya da HyperFrames)

| Tarz | Anahtar / araç | Görünüm | En iyi olduğu iş |
|---|---|---|---|
| Düz vektör (flat) | `flatVector` | düz renk, uzun gölge, hafif doku | haber açıklayıcı, rakam/veri, hızlı Reels |
| İzometrik kesit | `isometric` | 2:1 izometrik, üç ton | bina, şehir planı, "nasıl çalışır" (obruğun yer altı kesiti!) |
| Kinetik yazı | `kinetic` (kineticDemo) ya da HyperFrames + GSAP | hareketli büyük yazılar | alıntı, son dakika, slogan |
| Çizgi roman marker | `koi` | kalın kontur, marker dolgu | mizah, parodi, karakterli hikâye |
| Rubber hose (eski çizgi film) | `rubberHose` | 1930'lar siyah-beyaz çizgi film | nostalji, eğlenceli anlatım |
| Karikatür karakter | vize projesi ((örnek proje), chars.js) | büyük kafa, basit gövde | parodi, iç ses, öğrenci mizahı |
| Kâğıt kesik / kolaj | `fox`, `paperCraft`, `scrapbook` | yırtık kâğıt, gölgeli parçalar | çocuk, el işi, nostaljik (scrapbook örnek filmde reddedildi) |
| Gazete baskı / riso | `halftone`, `lighthouse` | raster nokta, iki renk | haber, eski gazete, manşet |
| Piksel | `pixelArt` | 16 renk piksel | oyun, gençlik, retro |
| Mavi kopya (blueprint) | `blueprint` | beyaz çizgi, mavi zemin | mühendislik, proje, inşaat |
| Tebeşir | `moonPhases` | kara tahta | eğitim, "biliyor muydunuz" |

## C · 3D

| Yol | Ne zaman | Nasıl |
|---|---|---|
| Low-poly (sahte 3D, aynı motor) | 3D hissi yeterliyse, en hızlısı | anidoodle `lowPoly`; `yeni_proje.sh --tarz lowPoly` |
| Three.js (kodla gerçek 3D) | dönen kamera, katmanlı yer altı, model | opus-animasyon `promptlar/08-threejs-3d.md` ya da HyperFrames Three.js adaptörü (`hyperframes-animation`); render Playwright ile kare kare |
| Blender (MCP) | gerçekçi ışık, karmaşık sahne, hazır modeller (Poly Haven, Sketchfab) | blender MCP: Blender açık ve eklenti bağlı olmalı (bağlantı zaman aşımına uğrarsa kullanıcıya Blender'ı açtır); `get_addon_status` ile başla. Model üretimi (`generate_3d`) kredi harcayabilir: izin al |

## D · Gerçekçi AI video
Flow/Veo (bkz. `ai-video.md`). Çizim tarzlarıyla karışabilir: ör. Flow ile üretilen bir kareyi plaka
yapıp kodla canlandırmak (karma yöntem, henüz denenmedi).

## Karma tarifleri
- **Harman (Flow + hareketli grafik)**: gövde Flow klipleri, açılış/ara/kapanış çizim motorundan.
  Her parça ayrı render, ffmpeg ile birleşir. Örnek: (örnek proje) (kurgu5.py,
  ses5.py) ve (örnek proje). Ciddi/gerilimli videoyu
  araya giren sevimli kartlarla BÖLME; grafik görüntünün üstüne çizilsin, ayrı siyah kart akışı bozar.
- **İki çizim tarzı bir filmde** (ör. laviş + izometrik yer altı kesiti): proje tek `--tarz` ile
  kurulur; ikinci tarzın modülü zaten `src/canvas-core/` içinde. Ona ait çekimleri ayrı plaka olarak
  o tarzın fırçalarıyla çiz, geçişi hikâye durum değiştirirken yap (anlatım "yerin altına" inerken).

## Tarz motoru dışında kalanlar (Three.js, Blender, Flow)
Ses hattı ve `birlestir.sh`, `kontrol.py` her MP4 ile çalışır. Altyazı ve logo o işte kdKit'ten
gelmez: render'ı sessiz al, üstüne ffmpeg overlay (logo PNG) ve HyperFrames/ASS altyazı ekle.
Three.js hattı bu skill'de henüz gerçek bir videoda denenmedi: ilk işte tek kareyle başla.

## Kare kare (frame-by-frame) his
Kodla çizimde her kare matematiksel olarak akıcıdır; elle çizilmiş "kare kare" titreşim istenirse:
- Çizgi titremesi (line boil): Gfx kalemlerinde `boil` > 0 ve seed'i her 2-3 karede değiştir
  (12 fps "on twos" hissi: `const ff = Math.floor(f / 2) * 2` ile çiz).
- Kendini çizen resim: `anidoodle/references/workflows/drawing-process.md` (timelapse).
- Gerçek elle çizim kareleri (kullanıcı çizerse) ffmpeg ile birleştirilir.

## Tarzdan bağımsız kalanlar (her tarzda geçerli)
sayfa kuralları (altyazı yeri, güvenli alan, metin, ses, logo yerleşimi):
`icerik-kurallari.md`. Logo/açılış/kapanış kitte tarza göre seçilir (`kodla-film.md`).
