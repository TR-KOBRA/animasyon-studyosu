# Sahne tasarımı: cümleden görüntüye

Her cümle bir görüntü kazanır; görüntü cümleyi tekrar etmez, onu GÖSTERİR. Bu dosya sahne
listesini ilk seferde onaylanacak hâle getirmek için.

## 1. Cümle → görüntü yöntemi
Her cümle için 3 görsel fikir yaz, en somut ve en az tekrar edeni seç:
- **Gerçek an**: cümlenin anlattığı şeyin kendisi (fotokopi sırası, kepenk inişi).
- **Nesne yakın planı**: anlamı taşıyan tek nesne (kira sözleşmesi, hesap makinesinde 11.000.000).
- **Sembol/metafor**: soyut fikir için (can güvenliği → baret; bilinmeyen gelecek → iş makinesi + "?").
Kural: aynı görsel fikir filmde iki kez kullanılmaz (sadece simge geri döner, bilinçli olarak).
Rakam, tarih, kurum adı geçen cümlede o bilgi sahnede kısa bir not olarak görünür (altyazıya ek,
ortada değil: nesnenin üstünde/yanında).

Her sahne bir şey kanıtlamalı: neyi kanıtladığını söyleyemiyorsan kes. Her çekim bir önceki cümlenin
açtığı soruyu cevaplar. Sahne tipleri (hazır kalıp): tek cümleli büyük yazı, kartlar, önce/sonra,
işaretleme (daire çizilir, etiket gelir), büyüyen sayaç, ızgara ("hepsi aynı", sonra biri bozulur).
Efekt/grafik araya girecekse her an için karar ver: kancanın ilk saniyesinde ve duygusal cümlede
girme. Kaydırma, kesme, tam ekran seçimini gerekçesiyle sahne listesine yaz.

## 2. Ritim
- Çekim süresi: anlatımlı belgesel 1,5-4 sn (ortalama ~2,4); müzikli Reels vuruş başına 0,5-1,5 sn.
- 0,7 sn altı çekimde göz nesneyi tanımaz: listeyi en sık kesmelerde (sayım: "yangın, elektrik,
  doğalgaz") bir sahnede birleştirmeyi öner.
- Her 15-20 sn'de bir "nefes" anı: geniş plan, yavaş kamera, ses biraz öne çıkar.
- Ortadaki dönüş sorusunda ("Peki neden…?") görüntü dili değişir: karanlık, sessiz, tek öğe.
- Görsel değişim: hızlı işte 2-4 sn'de bir kadraj, açı ya da grafik değişsin; belgeselde daha seyrek
  ama hiç durmasın. Bu rakam blog kaynaklı bir yön gösterge, kesin kural değil; kendi videolarının
  izlenme grafiğiyle ayarla.
- Ölü zaman yok: her saniyede bir şey değişir (kamera, figür, ışık, not); sadece kamera kayması
  "durgun" algılanabilir, kadrajda canlı bir öğe olsun.

- "On twos" (her pozu 2 kare tutma): elle yapılmış hissi verir; kolaj/belgesel grafiklerde dene:
  `const ff = Math.floor(f / 2) * 2`. Yumuşak kurumsal geçiş yerine basamaklı hareket.

## 3. Kamera dili
- Yavaş itme (push-in) duygu; yavaş geri çekilme (pull-out) bağlam/yalnızlık; yan kayma (pan)
  mekân tanıtımı; yukarı bakma (tilt-up) hayranlık (örnek film tavanı).
- Kamera hareketi çekimin %100'üne yayılır (ease in-out), çekim değişince yön değişebilir ama hız
  sıçramaz. Hız rampası yok.
- 9:16'da dikey kompozisyon: ana öğe üçte birlik çizgilerde, alt 450 px sakin (altyazı + logo),
  üst 250 px sakin. Sağda 130 px Reels butonları.

## 4. Geçişler (tarza göre)
Hazır kod ve mekanizmalar: `hareket-ve-efekt.md`, özellikle `anidoodle/references/motion-grammar.md`.
- Varsayılan: düz kesme, ama eşleşen kesme (şekil/konum/hareket aynı yerde: masadaki bardak →
  çay bardağı yakın planı).
- Boyalı tarzlarda: laviş "bloom" (kdKit veil), kâğıt örtme.
- Düz 2D: şekil dönüşümü (bir daire büyüyüp sonraki sahnenin güneşi olur), kart büyüyerek kadrajı
  doldurur, maske silme.
- 3D: kamera aynı sahnede yeni yere uçar (kesme yerine sürekli kamera).
- Asla: whoosh, flaş, dönerek kaybolma, rastgele efekt geçişleri.

## 5. Renk dramaturjisi
Filmin duygu eğrisini renkle çiz: başlangıç canlı → sorun anında renk çekilir/karanlık → çözüm ya da
kapanışta ya renk geri döner (umut) ya solgun kalır (kayıp). Tek renk "simge rengi" olsun
(örnek film: kemer renkleri). Işık yönü tüm filmde aynı (tutarlılık).

## 6. Simge (token)
Filmin başında doğan, ortada anlamı açılan, sonda geri dönen tek görsel öğe. Konu önerileri:
obruk → yerdeki ince çatlak (başta zararsız, sonda göl); Alaaddin Tepesi → toprak katmanı çizgisi;
Çatalhöyük → çatıdaki merdiven deliği. Simge izleyicinin aklında kalan kare olur (kapak görseli adayı).

## 7. Ses-görüntü eşleşmesi
- Kesme, cümlenin ilk kelimesinden 1-3 kare önce (`seslendirme_oturt.py` böyle yapar).
- Önemli kelimede görsel vurgu (not yazılır, nesne belirir) kelimeyle aynı karede.
- Efekt sadece ekranda gerçekten olan şeye (makas kesilince makas sesi); efekt bolluğu ucuzlatır.

## 8. Sahne listesi biçimi (onaya sunulan)
`assets/sahne_listesi_sablonu.md`'yi kullan: # | başlangıç sn | süre | cümle (kısaltılmış) | görüntü |
kamera | not/yazı | ses. Altına: simge nerede doğup nerede dönüyor, renk eğrisi tek satır.
Onaya sunarken 2-3 belirsiz sahne için A/B seçeneği yaz; gerisini sen karar ver.
