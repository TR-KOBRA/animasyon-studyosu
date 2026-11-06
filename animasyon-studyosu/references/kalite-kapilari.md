# Kalite kapıları: en az revizyonla teslim

Revizyon, kullanıcının gördüğü ilk sürümde bulduğu hatadır. Onu yakalamanın en ucuz yeri senin
kendi kontrolündür. Her kapıda: (1) kontrol listesini geç, (2) eksik varsa düzelt, (3) ancak sonra göster.
Kullanıcıya hiçbir zaman kendin bakmadığın bir kare/video gösterme.

## Revizyonu önleyen 8 alışkanlık
1. **Zevk profiline karşı kontrol et** (`zevk-profili.md`): göstermeden önce her maddeye bak.
2. **Seçenekleri sözle değil görüntüyle sun**: iki tarz/iki logo/iki geçiş varsa yan yana tek görsel.
   Kullanıcı tek bakışta seçer, tur azalır.
3. **Büyük kararları bir kerede, küçükleri sen ver**: brif, metin, sahne listesi, tarz karesi onaylanır;
   renk tonu, kamera hızı, efekt seviyesi gibi şeyleri sen karar verip söyle.
4. **Belirsizliği işaretle**: emin olmadığın 2-3 yeri gösterirken açıkça sor; geri kalanını savun.
5. **Önce en riskli parçayı kanıtla**: logo, en zor sahne, karakter yüzü… onu ilk tek karede göster.
6. **Değişikliği dar tut**: düzeltme isteği sadece o yeri değiştirir; diğer onaylı her şey kilitli.
   Onaylı karelerin kopyasını sakla (`*.bak`, `_onayli` adıyla), regresyonu karşılaştır.
7. **Sayısal kontrol + göz kontrolü**: `scripts/kontrol.py` teknik hataları bulur; tasarımı sen gözle.
8. **Dürüst rapor**: neye bakmadığını söyle; "videonun tamamını izleyemedim, şu anlara baktım".

## Kapı 0 · Brif (koda başlamadan)
- [ ] Tek cümlelik hedef, süre, format, tarz, ses türü, logo, çağrı yazılı ve onaylı (`assets/brif_sablonu.md`).
- [ ] Müşteri/sayfa kuralları biliniyor (sayfa mu, başka müşteri mi).
- [ ] Örnek video varsa analizi yapıldı (süre, kesme sayısı, yazı stili, ses).

## Kapı 1 · Tarz karesi
- [ ] Konunun kendi sahnesi (genel bir manzara değil), tam çözünürlük.
- [ ] Craft bar (`anidoodle/references/craft-bar.md`): elle yapılmış gibi mi, şekil montajı mı?
- [ ] Ayırt edici öğeler gerçeğe "anımsatıcı"; oranlar doğru; boş alan yok.
- [ ] Altyazı bandı, logo ve güvenli alanlar karede görünüyor ve temiz.

## Kapı 2 · Metin
- [ ] Tüm bilgiler bilgi dosyasında ✅; rakam/tarih/ad iki kez kontrol edildi.
- [ ] İlk 3 sn kancası somut ve görsel; kelime bütçesi süreye uygun.
- [ ] Yasak kalıplar yok (hikaye-ve-metin.md), humanizer'dan geçti.
- [ ] Her cümle çizilebilir (somut).

## Kapı 3 · Ses
- [ ] Kelime zamanları çıkarıldı, metinle karşılaştırıldı; farklar altyazıya yansıdı.
- [ ] Sayılar/özel adlar doğrulandı (whisper yanılır; şüpheli kelimeyi kırpıp yeniden yazıya dök).
- [ ] Kesilen tek şey uzun boşluk; kelime uçları sağlam (oturtulmuş sesi yeniden yazıya dök,
      kelimeler tam mı karşılaştır; ses dinleyemediğini unutma).

## Kapı 4 · Sahne listesi
- [ ] Her cümleye bir görüntü; aynı görsel fikir iki kez yok (simge hariç).
- [ ] 0,7 sn altı çekim yok ya da birleştirme önerildi.
- [ ] Simge ve renk eğrisi tanımlı; dönüş sorusunda görüntü dili değişiyor.
- [ ] Gerçek olmayan bir olayı gerçek gibi gösteren sahne yok.

## Kapı 5 · Kaba kurgu (ilk tam render öncesi)
- Sert direktör turu (opus-animasyon `promptlar/10-cilalama.md`): her çekimin ortasından ve her
  geçişin ortasından kare al (`node tools/still.mjs <ad> --frames ... --sheet`), 1-10 puanla:
  hikâye netliği, ritim, kompozisyon, okunabilirlik, renk, geçiş sürekliliği, detay.
- "Yapay zekâ şablonu gibi duran anlar", "aceleye gelen anlar", "ölü zaman" listesi; her biri sn+kare.
- P0 (şart) ve P1 (büyük) düzelt; hepsi ≥8 olana kadar, en fazla 3 tur. Sonra göster.

## Kapı 6 · Teslim
- [ ] `python film/tools/kontrol.py <final.mp4> --film <ad.ts> --max 89` temiz (süre, çözünürlük, fps,
      -14 LUFS ±1, gerçek tepe ≤ -1 dBTP, siyah kare yok, donma yok, uzun sessizlik yok).
- [ ] Kontrol sayfası (`kontrol.py` her çekimden kare çıkarır): altyazı yazımı, logo, kesik nesne.
- [ ] İlk kare ve son kare ayrıca kontrol. Reels kapağı videodan kare alınmadan, ayrı sahne olarak çizildi (`kapak.md`).
- [ ] Final sesi yazıya dök (`yaziya_dok.py`), metinle karşılaştır: her cümle duyuluyor mu, sırası doğru
      mu, son replik sonda sönen bölüme düşmüş mü? (bir işte bölünen cümleler sessiz çıktı, kullanıcı yakaladı.)
- [ ] Müzikli işte kesme hatası `vurus_izgara.py` ile ölçüldü; `CREDITS.txt` yazıldı; mono ses kontrol edildi.
- [ ] Rapora kullanıcının kulaklıkla bakacağı en riskli 5 an eklendi; "sesi güzel" denmedi, ölçüm verildi.
- [ ] Sessiz izleme testi: ilk 3 sn'nin karelerine sesi düşünmeden bak; konu ve merak anlaşılıyor mu?
- [ ] Ekrandaki her yazı okunacak kadar duruyor mu (kelime başına 0,3 sn, en az 0,7 sn)?
- [ ] Dosya adı anlamlı, masaüstüne kopyalandı; rapor yazıldı.

## Revizyon gelince
- İsteği kelimesi kelimesine not al (`REVIZYON.md`: tarih, istek, yapılan). Belirsizse tek soru sor.
- Kök nedeni bul: bu hata zevk profilindeki bir maddeyi mi kaçırdı, yoksa yeni bir tercih mi?
  Yeni tercihse `zevk-profili.md`'ye ekle: bir sonraki işte aynı revizyon gelmesin.
