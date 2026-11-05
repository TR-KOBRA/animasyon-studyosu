# AI video: Google Flow (Veo 3.1 + Nano Banana)

Kullanıcının Gemini Ultra aboneliğiyle Flow (labs.google/flow), built-in browser üzerinden. API
faturası istemiyor. Kredi pahalı: üretimden önce maliyeti söyle ve izin al.

API ile otomatik üretim ve Flow farkı: `entegrasyonlar.md`. Flow'un kendi API'si yok.

## Kredi ve model
- Veo 3.1 **Fast** x4 = 40 kredi; **Quality** x1 = 100, x4 = 400. Önce Fast ile dene.
- Quality referans görsel (Ingredients) kabul etmez; Ingredients modu için Fast.
- **Lite** "Extend" ile klip uzatma: edit sayfasında klip sonundaki "+" → Extend; ek yerinde sıçrama
  yok, ama ekte 15,0-15,9 sn arası sessizlik olabilir (önceki sesle doldur).
- Nano Banana görsel üretimi/düzenleme 0 kredi: kareleri burada hazırla.

## Kareler
- Başlangıç/bitiş karesi çiftini AYNI görselin düzenlemesiyle üret (çevre birebir aynı kalır).
- Logo/yazıyı Veo'ya yazdırma (harfleri bozar). İki yol: (a) logoyu Nano Banana ile kareye
  işle (logo Flow'a yüklenir), en sağlamı bu; (b) kurguda takip ile ekle (titredi, araçtan ayrı
  durdu, reddedildi).
- Uzak/farklı açılı kareyle start/end verme: Veo bina/tabela uydurur. Tek kare + yavaş kamera güvenli.
- Gerçek mekânda gerçek fotoğrafı referans ver; tarifle üretilen benzemedi (üniversite girişi).
- Kare seçerken önizlemeden doğrula (bir kez yanlış kare seçilip 400 kredi gitti).

## Prompt
- Kilitli kamera / sabit hız, bulanıklık yok, hayalet araç yok, şekil ve renk sabit, yazı değişmez.
- "explosive/patlama" kelimesi yıkım üretir, kullanma. Veo zaman atlamalı kliplere kendiliğinden
  müzik ekleyebilir: sesi kontrol et.
- Çok çekimli tek prompt (shot-by-shot) + start=önce, end=sonra iyi sonuç verdi (bina videosu).
- Veo'nun uydurduğu "anlamlı sürprizleri" (halıdan ot bitmesi) kabul etme; kullanıcı istemez.

## Akış ve geçiş dersleri (marka filmi)
- Start/end karesi verilen klipte araç o karelerde DURUR. Klip sonunu sonraki klibin başına
  bağlamak "dur-kalk" yapar. Geçişi kliplerin ORTASINDA, ikisi de hareket hâlindeyken, zemin hızı
  ve konum eşleşen karelerde yap (`cv2.phaseCorrelate` ile px/kare ölç), 10-14 kare bindirme.
- Kullanıcı tercihleri: tek kamera açısı, sabit hız, gerçek hız; hız rampası (hızlanıp yavaşlama)
  ve sert geçiş istemiyor; ışık dengesi tüm videoda aynı.
- Her klibi kare kare kontrol et (ffmpeg kontak sayfası): teker dönüşü, hiza, renk, logo okunurluğu.

## Tarayıcı
- Üretilmekte olan karoya tıklama: o üretim referansın "geçmiş sürümü" olur, kare seçicide çıkmaz.
- Prompt kutusundaki yazı geç görünebilir: tekrar yazmadan ikinci ekran görüntüsü al (iki kez yazılıp karıştı).
- Video adresi için `performance.setResourceTimingBufferSize(5000)` (salt okunur); Downloads'ta onay
  bekleyen .tmp aslında tam mp4 olabilir.
- Flow'da JS ile tıklama/script enjekte etme: "unusual activity" verip üretimi durdurdu. Sadece
  computer tool tıklamaları, JS yalnızca okuma için.
- İndirmeler Downloads'a iner, her biri onay bekleyebilir (.tmp); toplu indirme 2'şerli.
  Önizlemede `<video>` yok, kontrol için indirmek gerekir. Kullanıcı aynı anda sayfada
  tıklıyor olabilir: çakışmaya dikkat.
- Flow edit sayfasında "Next media" şeridi kaydırır; üst şeritteki küçük resimlere tıkla.
