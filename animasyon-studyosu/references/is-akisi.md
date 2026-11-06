# İş akışı (ayrıntılı)

Kullanıcının koyduğu düzen (24.10.2026) ve örnek filmde oturan sıra. Çerçeve opus-animasyon
reposudur (`~/.claude/skills/opus-animasyon`):
MOTION_RULES.md, 7 parçalı yönetmen brifi (`promptlar/02-yonetmen-brifi.md`), önce sahne listesi
onayı, sonra kod, kontak sayfası, cilalama (`promptlar/10-cilalama.md`).

## Aşama 0 · Durum ve brif
- İlk mesaj: durum özeti + ilk sorular (ayrı bir onay değil, brif onayının başı).
- Konunun varsayımını hızlıca doğrula (2-3 arama): "en büyük obruk" hangisi, olay gerçekten öyle mi?
  Hedef cümlesi yanlış varsayıma kurulmasın. Asıl araştırma Aşama 1'de.
- Örnek işin varsa önce çöz: `kesme_analiz.py` ile ölç, faster-whisper ile transkript çıkar, kareye bak.
  Referansın işini ayır: HAREKET referansı (video) ritmi, sahne değişimini ve tek fikri verir;
  GÖRÜNÜM referansı (site, marka, moodboard) renk, yazı ve hissi verir. Beş satırlık çözüm yaz: ritim,
  sahne değişimi, yazı, renk-ışık, tek fikir. Logosunu, metnini, karakterini alma. Kullanıcı açıkça
  "aynısı" demedikçe ruhunu al.
- Brif soruları turlar hâlinde (bir seferde 1-4 soru, seçenekli, önerin ilk sırada); bitince
  doldurulmuş brifi tek mesajda onaylat:
  1. Konu ve tek cümlelik hedef ("izleyici videodan sonra ne hissetsin/bilsin?")
  2. Süre (sayfa belgesel: en fazla 1:29) ve format (9:16, 1080x1920, 30 fps)
  3. Ses: kullanıcının kendi sesi mi, sadece müzik mi, ortam sesi mi (müzik varsa ticari serbest,
     Content ID kayıtlı olmayan parça)
  4. Tarz: çizim tekniğini seçtir (varsayılan yok; `tarzlar.md`: 3 aday + galeri + tek kare deneme)
  5. Sayfa ve logo: hangi sayfa/müşteri (`sayfalar.md`), logo nerede
  5b. "Temsili çizim/canlandırma" ibaresi konsun mu (özellikle bilimsel canlandırmada)
  5c. Araçlar: `baglan.py oneri <iş>` çıktısını özetle; eksik servis için kazanç ve maliyeti söyle (`entegrasyonlar.md`)
  6. Kapanış çağrısı: haber sayfasında içerik üreticisi vaadi YOK ("sonraki videoda…" denmez);
     tek yorum çağrısı ("Yorumlarda etiketle" gibi)

## Aşama 1 · Araştırma ve metin (anlatımlı işler)
- Araştırmayı sen yap (WebSearch; haber kaynakları, resmi açıklamalar). Bilgi dosyası:
  her bilginin yanında kaynak ve ✅/🟡/⚠️. Şüpheli bilgi metne girmez.
- Metin: konuşma dili, merak döngüsü (kanca → bağlam → soru → cevap → duygusal kapanış), spiker
  tonu yok, klişe yok, haber özetini tırnakla alıntılama yok. Yazdıktan sonra humanizer'dan geçir.
- Süre tahmini: Türkçe anlatımda ~2,4-2,8 kelime/sn. 1:29 için ~200-220 kelime.
- Metni `SESLENDIRME.txt` olarak ver: `/` kısa nefes, `//` duraklama işaretli, sonda kayıt ipuçları
  (tek seferde oku, hata yaparsan 2 sn bekle cümle başından tekrar, telefon 15-20 cm, sessiz oda).
- Kullanıcı metinde değişiklik isterse sadece istenen yeri değiştir; anlamı koru.

## Aşama 2 · Kayıt geldikten sonra
- Kullanıcıya nereye koyacağını söyle (genelde proje klasörü; telefon kaydı .mp4 olabilir).
  "Kayıt hazır" deyince en yeni ses/video dosyasını bul, adını doğrulat. Sayıyı yanlış anlama:
  "girişi 2 sn çek" 2 sn olsun demekti, uzat değil; belirsiz sayıda tek soru sor.
- Kaydı `kayit/` klasörüne al, kelime zamanlarını çıkar, metinle karşılaştır (kullanıcının okuduğu
  ile metin farklıysa altyazı kullanıcının söylediğine göre yazılır; yanlış duyulan sayıları
  yeniden dinleyip doğrula).
- Sahne listesini kayda göre çıkar: her cümleye/öbeğe bir görüntü, kesme kelimenin biraz önünde.
  Liste: çekim adı, başlangıç sn, ne görünüyor, hangi kelimeye oturuyor. Onaylat.

## Aşama 3 · Görsel
- Tarz karesi 2. onayda alındı; şimdi dünya/plakalar, sonra çekimler.
- Her tur sonunda 4-5 karelik kontak sayfası çıkar (`ffmpeg ... hstack`), Read ile kendin bak, sorunları
  düzelt, sonra gönder (SendUserFile).
- Kullanıcıdan gelen tipik eleştiriler: "çok boş", "detay az", "tekrar eden sahne", "insanlar hep
  sırtı dönük", "bardak vazoya benziyor" (nesne oranları gerçek olsun), "yazı ortada olmaz",
  "çok yavaş" (her cümleye bir görüntü), "kapanış vurucu değil".

## Aşama 4 · Ses ve render
- `references/ses.md` hattı. Render 8 worker ile (20 çekirdek var, fazlası kazandırmıyor).
- Uzun işleri arka planda çalıştır; kullanıcı beklerken gerçekçi süre söyle (önceki render
  günlüklerindeki `wall clock` satırına bak, tahmin uydurma).

## Aşama 5 · Teslim
- Final: `<Konu>_<Sayfa>.mp4`, `teslim.sh` ile `<sayfa> stok` klasörüne. Reels kapağı videodan kare alınmaz:
  ayrı sahne çizilir ve `<sayfa> stok kapak` klasörüne konur (`kapak.md`).
- Gece çalışırken: `SABAH_RAPORU.md` gibi bir rapor bırak.
- Bilgisayarı kapatmak: SADECE açık onayla (`shutdown /s /t 120`, iptal `shutdown /a`).

## Video bittikten sonra
- Beğenilen tarzı/öğrenileni bu skill'e ekle (references'a yeni ders, kit'e yeni parça). Kitte
  değişiklik yaparsan `assets/sablon/` altındaki kopyayı da güncelle.
