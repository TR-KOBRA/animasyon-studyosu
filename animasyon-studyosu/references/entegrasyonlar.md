# Entegrasyonlar: neyi nasıl bağlarız

Belgeler Kasım 2026'da okundu. Servisler değişir: hata alırsan önce güncel belgeye bak.

## İşe başlarken
Brifte iş türü belli olunca çalıştır, sonucu kullanıcıya sade dille söyle:

```bash
python scripts/baglan.py durum
python scripts/baglan.py oneri anlatim     # anlatim, parodi, gercekci, kurgu, muzik
```

Eksik ÖNERİ varsa ne kazandıracağını ve maliyetini tek cümleyle söyle, kullanıcı seçsin. Eksik ŞART varsa önce onu kur.
İşi durdurma: bağlı olmayan servisin yerine geçen yol hep var. Kullanıcı istemedikçe aynı öneriyi tekrar etme.

## Anahtar güvenliği
- **Anahtarı sohbette isteme.** `python scripts/baglan.py ekle elevenlabs --pencere` komutunu arka planda sen başlat: ekranda küçük pencere açılır, kullanıcı yapıştırıp Kaydet'e basar. Terminal yolu: `--terminal`.
- Anahtarı normal tarayıcıda (Chrome, Edge) kopyalat. Claude uygulamasının içindeki tarayıcıdan kopyalanan yazı Windows panosuna geçmez; pencerede eski pano yazısı görünür. ElevenLabs'te yeni anahtarın izinleri kapalı gelir: Text to Speech, Sound Effects, Music Generation, Voices (Read) açılmalı. Gerçek anahtar `sk_` ile başlar ve sadece oluşturulunca çıkan kutuda görünür; listeden kopyalanan 64 karakterlik yazı anahtar kimliğidir, çalışmaz.
- Kullanıcı anahtarı sohbete yapıştırırsa kullanma ve hiçbir dosyaya yazma. Sohbete düştüğü için sızmış say:
  servisin sitesinden iptal edip yenisini oluşturmasını söyle.
- Anahtarı ekrana, kayda, komut satırına, proje dosyasına ya da GitHub'a yazma. Doğrulama: `baglan.py dogrula`.
- Mümkünse kısıtlı anahtar: ElevenLabs'te sadece gereken izinler ve aylık kredi sınırı; Google'da bütçe uyarısı.

## Harcama
`eleven.py` ve `omni.py` kredi harcar. `--onay` olmadan sadece ne yapılacağını söyler. Önce onu çalıştır, kullanıcıya
söyle, açık onay alınca `--onay` ile çalıştır. Toplu üretimden önce tek örnek üret, dinlet ya da göster.

## ElevenLabs (API var)
`scripts/eleven.py`. Kullanılan uçlar: `/v1/text-to-speech/{voice_id}/with-timestamps`, `/v1/sound-generation`,
`/v1/music`, `/v2/voices`. Kimlik başlığı `xi-api-key`.
- **Anlatım:** `sesler` ile ses bul, kısa örnek üret, kullanıcı seçsin. `konus` sesi ve harf zamanlarından kelime
  zamanlarını yazar; `yaziya_dok.py` gerekmez, doğrudan `seslendirme_oturt.py`.
- **Efekt:** 0,5-30 sn, `--dongu` ile döngüsel ortam sesi. Bir olaya bir ses (`ses.md`).
- **Müzik:** 3-600 sn. Lisans ve ticari kullanım hesabın planına bağlıdır: yayından önce hesabın koşullarına bak, `CREDITS.txt`'e yaz.
- Metin normalizasyonu sayıları yanlış okuyabilir: sayıyı okunuşuyla yaz ya da dinleyerek kontrol ettir.
- Yeni modeller: `--model`. Varsayılan API'nin kendi modelidir; bu uçla çalışmayan model hata verir, o zaman modeli değiştir.

## Google Flow (API yok)
Üçüncü taraf kaynaklara göre Flow'un herkese açık API'si yok; resmî bir sayfayla doğrulanamadı. Kullanıcının aboneliğiyle tarayıcıdan çalışır (`ai-video.md`).
Otomatik script enjekte etme (Flow üretimi durdurmuştu), gayriresmî API ve çerez araçları kullanma.

## Gemini Omni Flash (API var, ayrı ücret)
`scripts/omni.py`, model `gemini-omni-1.1-flash`. Gemini API'deki Veo önizleme modelleri 22 Ekim 2026'da kapatıldı.
Uç: `POST /v1beta/interactions`, başlık `x-goog-api-key`. 9:16, 360p-4k, ilk kare, ilk+son kare, referans görsel.
- Flow kredileri burada geçmez; API ayrı ücretlenir. Fiyatı üretim öncesi Gemini API fiyat sayfasından kontrol et.
- Olumsuz alan yok: prompta "Do not ..." yaz. Tanınır kişi ve çocuk görseli yüklemek kısıtlı. Uzatma kısıtları bölgeye göre değişir.

| Durum | Yol |
|---|---|
| Kullanıcının Flow aboneliği var, az klip | Flow (ek ücret yok, elle) |
| Çok sayıda deneme ya da otomatik hat | Omni API (ücretli, tek komut) |
| Kritik tutarlılık | İkisinde de önce tek klip, kare kare kontrol |

## Diğerleri
| Araç | Bağlantı | Ne zaman |
|---|---|---|
| Blender | MCP, Blender açık olmalı | gerçekçi 3D sahne |
| Apify | MCP, hesap girişi | sosyal medya ve site verisi; kredili |
| Freesound, Pixabay | site | hazır efekt ve müzik; lisansı kontrol et |
| HyperFrames | skill | grafik ve yazı katmanı |

## Gerçek anahtarla ilk deneme
Bu araçlar sahte sunucuyla test edildi; gerçek servisle ilk kullanımda sırayla dene: `baglan.py dogrula`, `eleven.py sesler`,
tek kısa cümle, tek efekt. Sorun varsa hatayı kullanıcıya sade anlat, belgeye bakıp düzelt.
