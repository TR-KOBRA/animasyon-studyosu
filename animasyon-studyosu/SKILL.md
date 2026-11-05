---
name: animasyon-studyosu
description: "Sosyal medya için her türlü video/animasyon işinin ana giriş noktası . Önce çizim tekniğini kullanıcıya seçtirir (mürekkep-laviş, kalem-suluboya, düz 2D/flat, izometrik, karikatür/parodi, kâğıt kesik, gazete baskı, piksel, low-poly, Three.js/Blender 3D, Flow/Veo gerçekçi AI video ve 32 anidoodle tarzı), sonra işi yürütür: araştırma ve metin, seslendirme oturtma, sahne listesi, kodla çizim, altyazı, logo, açılış/kapanış, ses miksi, kurgu, teslim. Kullanıcı 'yeni video', 'animasyon yapalım', 'belgesel', 'Reels', '2D/3D animasyon', 'şehir hikâyesi videosu', 'bu konsepti kullanarak yeni içerik', 'seslendirmeyi oturt', 'logo ekle', 'render al', 'kurgu', 'edit', 'Flow'da video', 'parodi' dediğinde ya da herhangi bir video işine başlarken MUTLAKA önce bunu yükle; opus-animasyon, anidoodle, hyperframes, media-use, humanizer ve blender'ı hangi adımda kullanacağını bu skill söyler."
---

# Animasyon Stüdyosu

Bütün video altyapısı tek yerde: hangi işte hangi araç, işler hangi sırayla
yürür, hazır kodlar ve betikler, geçmişte neyin beğenilip neyin reddedildiği. Diğer skill'ler
(opus-animasyon, anidoodle, hyperframes, media-use, humanizer) motor ve rehber olarak kalır; bu
skill onları birbirine bağlar.

Kullanıcı yazılımcı değil: sade Türkçe, kısa, önerin başta. Skill adı/komut bekleme, kendin yükle.

## 1. İki ayrı soru: iş türü ve çizim tekniği

**İş türü** (araştırma/metin/ses hattını belirler):

| İş | Oku |
|---|---|
| Anlatımlı belgesel/hikâye (kullanıcının sesiyle) | `references/is-akisi.md`, `references/ses.md`, `references/icerik-kurallari.md` |
| Müzik/şarkı üstüne kısa animasyon (parodi, akım) | `references/is-akisi.md` (ses önce: şarkının vuruşları) |
| Gerçekçi müşteri videosu (bina, ürün, araç) | `references/ai-video.md`, `references/kurgu.md` |
| Hazır kliplerle kurgu/altyazı/logo/müzik | `references/kurgu.md` |

**Çizim tekniği** her işte AYRICA seçtirilir; varsayılan yok. Konuya göre 3 aday öner (önerin ilk
sırada, her birine bir cümle gerekçe), `scripts/tarz_onizleme.sh` ile adayları yan yana, Türkçe
etiketli tek görselde göster, seçilen tarzı konunun kendi sahnesiyle tek karede kanıtla. Katalog ve nasıl seçtirileceği: **`references/tarzlar.md`**. Kısaca aileler:

- **Elle çizim görünümü**: mürekkep-laviş (örnek filmde onaylı hazır ayar:
  `references/tarz-murekkep-lavis.md`), kalem-suluboya, masal guajı, sumi-e, kömür, renkli kalem,
  tükenmez, gravür/nokta, ukiyo-e, yağlı boya.
- **Düz 2D / grafik**: flat vektör, izometrik kesit, kinetik yazı, çizgi roman, rubber hose,
  karikatür karakter, kâğıt kesik, gazete baskı, piksel, blueprint, tebeşir.
- **3D**: low-poly (aynı motor), Three.js (kodla gerçek 3D), Blender (MCP, gerçekçi ışık/model).
- **Gerçekçi AI video**: Flow/Veo.
- **Harman**: Flow klipleri gövde + kodla çizilmiş hareketli grafik (bir parodide sevildi).

Brifte iş türü belli olunca `python scripts/baglan.py durum` ve `oneri <iş>` çalıştır: bağlı servisleri ve eksikleri söyle, en iyi sonuç için ne bağlanmalı öner (`references/entegrasyonlar.md`).
Herhangi bir hareket, efekt ya da geçişi yazmadan önce `references/hareket-ve-efekt.md`'ye bak: çoğu
zaten kurulu. Dış repo adayları ve kurulmaması gerekenler: `references/arac-haritasi.md`.
Hangi sayfa için (kitle, ton, logo, ses): `references/sayfalar.md`. Geçmiş projeler ve dersleri:
`references/projeler.md`.

## 2. Çalışma düzeni: 5 onay, gerisi senin işin

Hedef en az revizyon. Kullanıcı sadece 5 noktada onay verir; bu noktalar arasında her kararı sen
verirsin ve kalite kapısından (`references/kalite-kapilari.md`) geçirmeden hiçbir şey göstermezsin.

| Onay | Ne sunulur | Hazırlarken oku |
|---|---|---|
| 1. Brif | durum özeti + sorular (tarz `tarz_onizleme.sh` görseliyle seçilir), sonunda doldurulmuş `assets/brif_sablonu.md` | `is-akisi.md`, `tarzlar.md`, `sayfalar.md` |
| 2. Tarz karesi | seçilen tarzla konunun kendi sahnesinden 1 tam kare (brif onayından sonra proje kurulur) | `tarzlar.md`, `kodla-film.md` |
| 3. Metin | `SESLENDIRME.txt` + bilgi dosyası; 2-3 kritik yer A/B işaretli | `hikaye-ve-metin.md` |
| (bekleme) | ses: kullanıcı kaydı/şarkıyı verir ya da AI sesi üretilir; onay değil, sıranın gereği | `ses.md` |
| 4. Sahne listesi | sese göre, `assets/sahne_listesi_sablonu.md` | `sahne-tasarimi.md` |
| 5. Final | video + Reels kapağı + `kontrol.py` raporu + kontrol sayfası | `kalite-kapilari.md` |

Her zaman:
- **Göstermeden önce `references/zevk-profili.md`'ye karşı kontrol et.** Oradaki her madde, geçmişte
  revizyon olarak geri gelmiş bir şey.
- Önce ses (kayıt ya da şarkı), sonra zamanlama. Bilgi dosyasında ✅ olmayan bilgi metne girmez.
- Seçenekleri sözle değil görüntüyle sun; kullanıcıya hiç bakmadığın kare/video gösterme.
- Revizyon gelirse: sadece o yeri değiştir, kök nedeni zevk profiline yaz.
- Teslim raporu dürüst: süre, LUFS, neye bakıldı, neye bakılamadı.
- Soru aracı (AskUserQuestion) ya da dosya gönderme aracı (SendUserFile) yoksa: soruları numaralı
  seçeneklerle metin olarak sor, görselin tam dosya yolunu yaz.

## 3. Kesin kurallar

- **Kullanıcının kendi sesine dokunma**: gürültü temizleme, sıkıştırma, EQ, kelime kesme yok; sadece uzun
  sessizlik/nefes kısaltılır; seviye düz kazançla -14 LUFS.
- **Resmin ortasına altyazı koyma**: altyazı alt bantta (y≈1495), odak alanına girmez. (Kanca
  yazısı gibi tasarımın kendisi olan büyük yazılar ayrı konu: sayfanın diline göre, `sayfalar.md`.)
- **sayfa'da başka sayfanın logosu/filigranı asla yok**; kendi logosu altta, tarza uygun
  görünümde, şekli/renkleri dışına çıkmadan (müşteri işinde müşterinin kuralı).
- Gerçek kişilerin yüzü çizilmez; dini hassas figürler yüzsüz; şiddet, kan, yangın yok. Gerçekte
  olmamış olayı (yıkım) gerçekmiş gibi gösterme, sembolik anlat.
- **Bilgisayarı asla sormadan kapatma** ("yatıyorum" onay değildir).
- İndirme, dış servise yükleme, kredi harcayan üretim (Flow, Blender generate_3d): önce izin, maliyeti söyle.
- **API anahtarını sohbette isteme.** Kullanıcı kendi terminalinde `baglan.py ekle` ile girer. Sohbete yapıştırırsa kullanma, iptal ettirip yenisini aldır.
- Klasör yolları ASCII (Türkçe karakterli yollar araçları bozuyor).

## 4. Kodla film: hızlı başlangıç (anidoodle motoru; elle çizim, 2D ve low-poly tarzları)

```bash
bash ~/.claude/skills/animasyon-studyosu/scripts/yeni_proje.sh obruk --tarz isometric   # tarz = kullanıcının seçtiği
cd ~/obruk_anim/film
node tools/still.mjs obruk --frames 60 --scale 1 --out out/deneme.png          # tek kare
node tools/render.mjs obruk --scale 1 --workers 8 --out out/obruk_sessiz.mp4   # tam render (~1 dk / 30 sn video)
```

Proje hazır gelir: motor, `kdKit.ts` (plaka+kamera, altyazı bandı, logo, tarza göre açılış/kapanış,
figür ve yürüyüş), `gokWorld.ts` (fırçalar, figür/poz sistemi, Türkçe harfler), başlangıç filmi ve
ses betikleri. Seçilen tarzın kendi fırçaları motorda `src/canvas-core/<tarz>.ts`: dünyayı o elle çiz.
Ayrıntı ve tuzaklar: `references/kodla-film.md`. Three.js/Blender için `references/tarzlar.md` C bölümü.

## 5. Ses hattı (anlatımlı işler)

kayıt → `yaziya_dok.py` → `kurgu.py` → `seslendirme_oturt.py` → render → `sesmiks.py` →
`ses_karistir.py` → `birlestir.sh` (-14 LUFS, MP4) → `kontrol.py` (teslim kontrolü). Komutlar: `references/ses.md`.

Teslimden önce her zaman:
```bash
python film/tools/kontrol.py film/out/<ad>_final.mp4 --film film/src/canvas-core/<ad>.ts --max 89
```
Süre, çözünürlük, fps, -14 LUFS, gerçek tepe, siyah kare, donmuş görüntü (ölü zaman), uzun sessizlik;
ayrıca her çekimin ortasından kare içeren kontrol sayfası (Read ile bak). ❌ varsa düzeltmeden teslim etme.

## 6. Yardımcı araçlar (kuruldu, denendi)

| İhtiyaç | Komut (`scripts/`) | Sınır |
|---|---|---|
| Örnek videonun ritmini ölç | `kesme_analiz.py <video> --sheet s.jpg` (venv_goruntu) | yaklaşık; yumuşak geçişi kaçırır |
| Özneyi arka plandan ayır | `ozne_ayir.py <png\|klasör> <çıktı>` (venv_goruntu) | videoda kenar titreyebilir |
| Sesten ağız hareketi | `agiz_senkron.sh <ses> <json>` + kitte `mouthAt`, `mouthOpen` | sadece konuşma sesi ver |
| Akıcılık, ağır çekim | `ara_kare.sh <girdi> <çıktı> [fps] [yavaşlatma]` | hızlı arka planda bulanıklaşır; çizime uygulama |
| Bağlantı durumu, araç önerisi, anahtar | `baglan.py durum`, `oneri <iş>`, `ekle <servis>`, `dogrula` | anahtarı Claude'a yazma |
| ElevenLabs ses, efekt, müzik | `eleven.py sesler`, `konus`, `efekt`, `muzik` | kredi harcar; `--onay` şart |
| API ile AI video | `omni.py --prompt ... --out ...` | Flow kredisi geçmez; `--onay` şart |
| Müzik vuruşu, kesme hatası | `vurus_izgara.py <müzik> --film <ad.ts>` (venv) | seyrek vuruşlu parçada güvenilmez; bas uyarısını ciddiye al |

`venv_goruntu` = `~/araclar/venv_goruntu/Scripts/python.exe -I`; `venv` = `.../araclar/venv/...`.
Ayrı tutuldu: Whisper ve Demucs ortamı bozulmasın.

## 7. Hangi skill ne zaman

- **opus-animasyon**: kural çerçevesi (MOTION_RULES.md, yönetmen brifi, cilalama), Three.js tarifi.
- **anidoodle**: motor, 32 tarz, karakter tutarlılığı, kendini çizen resim, müzik bestesi.
- **hyperframes** ailesi: HTML tabanlı grafik/kinetik yazı/kurgu, hazır bloklar, Three.js adaptörü.
- **media-use**: telifsiz müzik/efekt, transkripsiyon, arka plan silme.
- **humanizer**: yazdığın her metni (seslendirme, açıklama) yapay zekâ kalıplarından temizle.
- **blender MCP**: 3D sahne/model/ışık (Blender açık olmalı).

## 8. İş bitince
Öğrenileni buraya ekle: yeni tarz onaylandıysa `references/tarz-<ad>.md` hazır ayarı yaz ve
`tarzlar.md`'de işaretle; kit değiştiyse `assets/sablon/` kopyasını güncelle; projeyi `projeler.md`'ye ekle.
