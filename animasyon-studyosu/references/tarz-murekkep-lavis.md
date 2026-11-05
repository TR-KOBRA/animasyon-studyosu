# Hazır ayar: Mürekkep + laviş belgesel (hazır ayar)

Tarz seçeneklerinden BİRİ (bkz. `tarzlar.md`). 28.10.2026'da örnek film videosunda kullanıldı,
yayınlandı, çok beğenildi. Duygusal, mekân/anı odaklı yerel belgeseller için güçlü aday; ama her
konuda varsayılan değil, kullanıcı seçerse kullanılır. Genel sayfa kuralları:
`icerik-kurallari.md`.

Proje: `bash scripts/yeni_proje.sh <ad> --tarz wren` (başlangıç dosyası bu ayarla gelir).
Tam örnek kod: (örnek proje), `gokVignettes.ts`.

## Çizim
- Anidoodle "wren" eli: önce ıslak laviş (şeklin biraz dışına taşar, pigment alt kenarda birikir),
  sonra esnek uçlu mürekkep kontur (basınçta kalın, kalkışta ince, ışığın yediği yerde açık).
  Fırçalar: `W.wet`, `W.dab`, `W.pen`, `W.ink` (gokWorld.ts).
- Kâğıt dokusu her karenin sonunda: `g.paper("coldpress", 0.14); g.paper("paper", 0.07)`.
- Büyük düz alanlar lavişle topaklanır: düz dolgu + cetvel kenar çizgisi.
- Nesneler gerçek oranında (bardak vazoya benzedi). Figürler orta mesafede (yakın plan kaba durur).
- Dünya plakaları pz 1.6, yakın planlar pz 1.1; kamera yavaş itme.
- Scrapbook/albüm düzeni bu işte denendi ve reddedildi.

## Renk dramaturjisi
Canlı renk → "kapandı" anında renkler solar (`faded` plakalar) → karanlık vuruş ("Peki neden
kapandı?") → son: solgun. Filmin simgesi en son gider.

## Yazı
Altyazı düzgün büyük harf mürekkep (el yazısı değil), harf harf yazılır, altında hafif kâğıt lekesi,
her harfte daktilo sesi. Sahne içi notlar (tarih, tutar) `W.note` ile aynı harflerle.

## Logo, açılış, kapanış (kit ayarı: logo "wash", opening "ink", closing "paper")
- Logo: beyaz sayfa logosu, harfler kâğıt beyazı, arkada kâğıda yumuşak dağılan koyu laviş,
  kırmızılar suluboya, kalem kontur. İlk saniyede damla gibi yayılır.
- Açılış: boş kâğıda mürekkep damlası düşer, sahne ondan açılır (0,8 sn, süre eklemez).
- Kapanış: son sözden sonra sahne kâğıtla örtülür, logo ortaya yükselip 2 kat büyür.

## Ses
Daktilo her harfte, mekânın ortam uğultusu sahneye göre, sahneye bağlı efektler (makas, alkış,
kepenk, taş). Fon müziği bu videoda kaldırıldı. CC0 set: (örnek proje).
