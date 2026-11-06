# Reels kapağı: ayrı bir sahne olarak çiz

Kapak, videodan alınmış bir kare değildir. Bir kareyi koyulaştırıp üstüne yazı koymak, başlığı büyütmek ya da
renk değiştirmek kapak yapmaz; izleyici bunu "videodan ekran görüntüsü" diye okur. Kapak, videoda geçmeyen,
tek başına merak uyandıran yeni bir sahnedir.

## Sahne fikrini bulma
1. Videonun tek cümlelik fikrini yaz. Örnek: "Kuyu, kuleden derin."
2. Bu fikri bir olaya çevir, bilgi grafiği yapma. Soruyu sor: "Bu fikir gerçekten yaşansaydı ne görürdük?"
   Örnek: Kule köy kuyusunun içine gömülüyor, çiftçi başını tutuyor.
3. Karşılaştırma varsa sahnenin dilini değiştir. Sıralama fikri kürsüye, ağırlık fikri teraziye, kaçış fikri koşuya dönüşür.
4. Sahnede bir tepki olsun: şaşıran bir siluet, düşen taşlar, konfeti. Tepki izleyiciye ne hissedeceğini söyler.
5. Abartı serbesttir ama bilgi yalan söylemez. Sembolik sahne ile videodaki gerçek rakam çelişmesin; çelişen sayıyı kapağa yazma.

## Kurallar
- Videodaki hazır dünyayı, kamerayı ve çizimi yeniden kullanma. Ortak olan sadece konu, renk dili ve marka olabilir.
- En büyük öğe başlıktır. İki satır yeterli: üst satır kabartmalı, alt satır eğik renkli şeritte; genişliğin yaklaşık yüzde 80'i.
- Başlık sahnedeki öğelere değmez. Başlık ve sahne kendi alanında durur.
- Tek odak, güçlü ışık: gün batımı, spot, parlayan öğe. Küçük detay ikinci plandadır.
- Gerçek kişi yüzü çizme, siluet kullan.
- Metinde en fazla 6-7 kelime. Kapak bilgi anlatmaz, soru açar.

## Ölçü
Kare 1080x1920. Önemli her şey 3:4 profil ızgarası kesiminde kalmalı: y 240 ile 1680 arası. Sağ ve sol kenardan
en az 60 px boşluk bırak. Üst 240 px'e sadece gökyüzü ya da arka plan koy.

## Üretim
Kapak ayrı küçük bir film olarak yazılır (`src/canvas-core/<ad>kapak.ts` ve `src/hosts/page-<ad>kapak.ts`),
tek kare alınır:

```bash
node tools/still.mjs <ad>kapak --frames 5 --scale 1 --out out/kapak.png
```

## Kontrol
- [ ] Bu sahne videonun hiçbir çekiminde yok mu?
- [ ] Sesi ve metni bilmeyen biri kareye bakınca "bu ne?" der mi?
- [ ] Başlık küçük izlemede (3:4 kesiminde 180 px genişlikte) okunuyor mu?
- [ ] Kenarlarda boş şerit ya da çizimin bittiği yer görünüyor mu?
- [ ] Kapaktaki sayı ve iddia videoyla çelişiyor mu?
