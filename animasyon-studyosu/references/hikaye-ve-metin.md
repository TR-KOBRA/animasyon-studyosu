# Hikâye ve metin (araştırmadan seslendirme metnine)

Amaç: kullanıcının ilk okumada "tamam, bunu okurum" dediği metin. örnek filmde metin v1-v3
reddedildi, v11'de oturdu; o 8 turu bu kurallarla baştan önle.

## 1. Araştırma protokolü
1. En az 3 bağımsız kaynak: yerel haber sitesi, ulusal haber,
   resmi kaynak (belediye, üniversite, AFAD, MTA, müze). Akademik kaynak varsa (DergiPark) bilimsel
   açıklama için onu kullan.
2. `BILGI_DOSYASI.md`: her bilgi bir satır: bilgi | kaynak (link) | ✅ iki kaynak / resmi, 🟡 tek kaynak,
   ⚠️ çelişkili. Rakamlar, tarihler, kurum adları, yer adları mutlaka ✅.
3. Metne sadece ✅ girer; 🟡 bilgi "yaklaşık", "bildirildiğine göre" gibi yumuşatılarak girebilir,
   ⚠️ girmez. Gerçekte olmamış şeyi ima eden cümle kurma. Bilimsel canlandırma serbest (obruğun
   oluşumu gibi) ama cümle "şöyle oluşur" der, "o gece şunu gördük" demez; brifte "Temsili" kararı sorulur.
4. Görsel referans: `GORSEL_REFERANS.md`: mekânın ayırt edici 3-5 öğesi (renk, şekil, malzeme),
   fotoğraf linkleri. Çizim bunları yakalamalı.
5. Konu bilimsel ise (obruk, tepe oluşumu): mekanizmayı 3 adımda anlatabilecek kadar anla
   (ör. obruk: yeraltı suyu çekilir → kireçtaşı boşluğunun tavanı desteksiz kalır → çöker).
   Bu 3 adım sahne listesinin omurgası olur.

## 2. Yapı (süreye göre iskelet)
Kullanıcının ölçülmüş okuma hızı ~2,3 kelime/sn (örnek film, boşluklar kısaltılmış). Kelime bütçesi
bu hıza göre; AI seste hız 1,1x'e çıkarılabilir:

| Süre | Kelime | İskelet |
|---|---|---|
| 15-20 sn | 30-45 | kanca (3 sn) → tek şaşırtıcı bilgi → tek görsel vurgu → çağrı |
| 30-45 sn | 65-100 | kanca → bağlam → soru → cevap (2 bilgi) → kapanış |
| 60 sn | 125-135 | kanca → bağlam → merak sorusu → 3 adımlı cevap → duygusal/şaşırtıcı kapanış → çağrı |
| 89 sn (1:29) | 185-200 | kanca → anı/bağlam (izleyiciyi içeri al) → ortada dönen soru ("Peki neden…?") → veri (rakam, tarih, kurum) → olay → bugün → duygusal kapanış → tek çağrı |

## 3. Kanca bankası (ilk 2-3 saniye; ilk karede yazı/hareket başlamış olmalı)
İzleyicinin kendi deneyimine ya da merakına dokun; konu adıyla başlama.
- Tanıma: "Bu okulda okuduysanız bu tavanı tanırsınız." (işe yaradı)
- Ters köşe: "Konya ovasında bir gece yer yarıldı ve sabah orada bir göl vardı."
- Gözün önündeki sır: "Alaaddin Tepesi'ne her gün bakıyorsunuz ama aslında bir tepe değil."
- Soru: "9 bin yıl önce Konya'da insanlar evlerine neden kapıdan değil çatıdan giriyordu?"
- Rakam: "Konya'da son <N> yılda <doğrulanmış sayı> obruk açıldı." (kalıp; sayı bilgi dosyasında ✅ olmadan kullanılmaz)
Görsel kanca sözel kancayla aynı anda: ilk karede ne olduğu merak edilen ama tanınan bir görüntü.

Kanca bir vaat taşır: büyük soruyu söyle, ilk şaşırtıcı bilgiyi 5 sn içinde göster. Kendi başparmağını
durdurmuyorsa ilk 3 sn'yi yeniden kur. Son cümleyi beş kelimeye sığdırmayı dene.

## 4. Dil kuralları
- Doğruluk dili: araştırma sadece benzerlik gösteriyorsa "benziyor" de, "aynısı" deme; tek nedene
  bağlama: "nedenlerden biri" de, "nedeni" deme. Ekrandaki ad, tarih ve sayıları bilgi dosyasıyla harf
  harf karşılaştır.
- Konuşma dili, kısa cümle; bir cümlede tek bilgi. Okunurken nefes yerleri doğal.
- "Siz" hitabı; kapanışta bilinçli "sen"e geçiş duygusal vurgu yapar (örnek film).
- Yasak: "Gelin birlikte bakalım", "peki ama", "işte tam da bu noktada", "unutulmaz", "eşsiz",
  "tarihe tanıklık eden", "büyüleyici", "gizemli dünyası", "hayranlık uyandıran", "nice", "adeta".
  Bunlar yapay zekâ/spiker kokusu.
- Rakamları yazıyla değil rakamla yaz (altyazıda da), okunuşunu düşün ("2025'in" → "iki bin yirmi beşin").
- Haber özeti tırnakla alıntılanmaz; kaynak bilgisini kendi cümlenle ver.
- Her cümle bir görüntüye dönüşebilmeli: soyut cümle ("önemli bir değişim yaşandı") yerine somut
  ("kepenkler indi"). Çizilemeyen cümleyi yeniden yaz.
- Yazdıktan sonra humanizer skill'i ile geçir, sonra sesli okuma süresini hesapla.

## 5. Teslim biçimi: SESLENDIRME.txt
```
<KONU> — SESLENDİRME METNİ v1
İşaretler:  /  kısa nefes     //  duraklama (yarım-1 sn)
------------------------------------------------------------
<paragraflar, / ve // işaretli>
------------------------------------------------------------
KAYIT İPUÇLARI
- Baştan sona tek seferde oku. Hata yaparsan 2 sn bekle, cümlenin başından tekrar oku.
- Giriş enerjik; cümle sonlarını yutma.
- <özel vurgu notları: hangi cümleden sonra 1 sn sus>
- Halılı oda, klima/buzdolabı kapalı, telefon ağzından 15-20 cm.
```
Yanına tahmini süre (sn) ve kelime sayısı yaz. Metnin altında: hangi bilgi hangi kaynaktan (kısa).

## 6. Metin onayı turu
Metni gönderirken 2-3 kritik yeri işaretle ("burada iki seçenek var: A… B…"); kullanıcı tek mesajla
seçsin. Tüm metni baştan yeniden yazdırmaktan iyidir.
