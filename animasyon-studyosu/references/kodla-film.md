# Kodla film: motor, kit, tuzaklar

Motor: anidoodle engine (`~/.claude/skills/anidoodle/engine`, Apache-2.0). `yeni_proje.sh` onu
proje klasörüne kopyalar (node_modules dahil, Remotion yok; Playwright chromium-1243 kurulu).
Bir film = `src/canvas-core/<ad>.ts` (Film nesnesi) + `src/hosts/page-<ad>.ts` (3 satır). Film adı
ASCII ve tek kelime olmalı.

## Komutlar (proje `film/` klasöründe)
```bash
node tools/still.mjs <ad> --frames 0,300,900 --scale 1 --out out/kare/ --sheet out/sheet.jpg   # kareler + kontak sayfası
node tools/still.mjs <ad> --frames 0-300:50 --scale 0.5 --sheet out/s.jpg                      # aralıklı
node tools/render.mjs <ad> --scale 1 --workers 8 --out out/<ad>_sessiz.mp4                    # tam film (sessiz)
node tools/render.mjs <ad> --scale 1 --from 600 --to 900 --out out/parca.mp4                 # sadece bir bölüm
npx tsc --noEmit -p .                                                                          # tip kontrolü
```
- Render hızı: örnek film 2668 kare 8 worker ile 193 sn (~13,8 kare/sn). 20 worker kazandırmaz
  (kodlayıcı ve her sayfanın plakaları yeniden çizmesi darboğaz).
- Render günlüğünü dosyaya yaz (`> out/render.log 2>&1`), arka planda çalıştır; günlükteki
  `wall clock` ve çekim başına `draw median` satırları yavaş sahneyi gösterir (bütçe 150 ms/kare).
- Kontak sayfasını kendin Read ile incele, sonra kullanıcıya gönder.

## Sözleşme (bozulursa kareler titrer ya da render farklı çıkar)
- Her kare `draw(ctx, f, env)` içinde sadece `f`'nin fonksiyonu. `Math.random` yok; `rng(seed)` ve
  `fractal(seed, x, y, …)` kullan. Aynı seed aynı şekli verir: her nesneye ayrı seed.
- `ctx.filter` YASAK (render yolunda yok); bulanıklık için `g.group("paint", fn, { blur: N })`,
  solukluk için `faded()` (piksel işlemi).
- Ağır çizimler plakaya: `plate(env, key, opaque, (g) => …, pz)` bir kez çizer, önbelleğe alır.
  Dünya plakaları pz 1.6 (kamera 1.6x'e kadar yaklaşabilir), yakın plan plakaları pz 1.1.
- Canlı (her karede değişen) öğeler plakanın üstüne `Gfx` ile: figürler, buhar, ibreler, kâğıtlar.

## kdKit (assets/sablon/kdKit.ts) özet
```ts
const K = kit({ fps: 30, duration: DURATION,
  logo: { style: "wash" | "pencil" | "plain", width, y } | false,   // boyalı tarz: wash/pencil; düz 2D/3D: plain
  opening: "ink" | "fade" | "none", closing: "paper" | "fade" | "none", bg,
  caption: "ink" | "clean" });   // yeni_proje.sh tarza göre seçer; başka marka logosu: logo.box (sayfalar.md)
// draw sonu sırası önemli:
K.opening(ctx, env, f); K.closing(ctx, env, f);       // kâğıt perdesi (resmin üstünde)
if (PAINTED) { g.paper("coldpress", 0.14); g.paper("paper", 0.07); }   // kâğıt dokusu sadece boyalı tarzlarda
K.narration(ctx, env, f, LINES);                      // altyazı (dokunun üstünde, okunur)
K.watermark(ctx, env, f);                             // logo en önde
// assets: K.ASSETS  (film/assets/logo_renkli.png, logo_beyaz.png)
```
- Kapanış süresi `closeFrames` (varsayılan 52 kare). DURATION'ı son sözün bitişinden ~1,7 sn sonraya
  koy; 1:29 sınırı varsa DURATION ≤ 2670.
- Yardımcılar: `seg, ease, lerp, eo, clamp01`, `plate, faded, showP, look, clampCam, camLerp, camXf,
  HOME`, `standAt(g, x, y, boy, poz, görünüş, LOOKS[i], seed, { face })`, `walkPose(view, faz)`.
- Kamera: `clampCam` kullan, yoksa kamera çizilmiş dünyanın dışını gösterir (boş kenar).

## gokWorld (assets/sablon/gokWorld.ts) özet
- Malzeme: `W.wet(g, poly, renk, { alpha, seed, pool, edge })` ıslak laviş, `W.dab` küçük leke,
  `W.pen(g, noktalar, kalınlık, seed, opaklık, titreme, renk)` mürekkep çizgi, `W.ink(g, fn)` çizgi grubu.
- Figür: `W.figure` / kitteki `standAt`; pozlar `W.POSE` (stand, stride, lookUp, walkSide, talkSide,
  sitFront, sitBack, sitSide), kıyafetler `W.LOOKS` (21 adet). Yakın planda kaba durur: orta mesafe.
- Yazı: `W.caption` (altyazı bandı), `W.note(ctx, env, metin, x, y, boy, n, alpha, renk)` sahne içi
  not. Türkçe harfler, `?` ve `₺` var; yeni bir karakter gerekirse `GLYPHS`'e çizgi olarak ekle.
- örnek filme özgü parçalar (tonoz, kemer, masa, sandalye, sütun) da içinde: yeni konuda
  kullanılmaz ama örnek olarak durur. Perspektif yardımcıları `W.at([x,y], z)` tonoz dünyasına
  bağlı; yeni dünyada kendi perspektifini kur.

## örnek filmden öğrenilen tuzaklar
- Büyük düz alanlar laviş ile "topak" görünür: düz dolgu + cetvel kenar çizgisi (ruled) kullan.
- Yakın plan nesnelerde gerçek oran şart (bardak/vazo hatası). Referans fotoğrafa bak.
- Hesap makinesi gibi ekranlı nesnelerde sayılar ekrana sığsın, sağa yaslansın.
- Ölü zaman: örnek filmin "üniversite" çekiminde (55,8-60,1 sn) ikon ve yazı 2,2. sn'de bitip kamera sabit kaldı; görüntü ~2 sn dondu (kontrol.py yakaladı, gözle kaçmıştı). Her çekimde kamera hafif itsin ya da canlı bir öğe sürsün.
- Çok kısa çekimlerde (<0,7 sn) animasyon yarıda kalır: zamanlamayı `at(sn)` ile çekimin içine koy.
- Çöküş/düşüş gibi hızlı olaylar: başlangıç karesini `t0 + Math.floor(k * 1.5) + rand` gibi sık tut,
  yoksa çekim biter, olay görünmez.
- Logo görseli: içerik kutusu `LOGO_SRC` 1080x1080 dosyanın içinde x151-928, y284-795; başka logo
  dosyası gelirse bu kutuyu yeniden ölç.
- Yorum satırları İngilizce ve açıklayıcı (motorun üslubu); kullanıcıyla konuşma Türkçe.

## Başka tarz (parodi, karikatür…)
- kdKit'in logo/açılış/kapanış/altyazı kısmı tarzdan bağımsız kullanılabilir (`logo: false` ile
  logosuz). Çizim dili için `anidoodle/references/styles/INDEX.md` ve
  `anidoodle/references/workflows/character-consistency.md` dosyalarını oku; karakter kartını önce onaylat
  (vize parodisi: (örnek proje), karakter_karti_v2.png onaylı).
