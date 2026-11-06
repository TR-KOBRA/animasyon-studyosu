# Ses hattı

Python: `~/araclar/venv/Scripts/python.exe -I` (faster-whisper, numpy, librosa burada). Hepsi
ffmpeg ile okur/yazar, 48 kHz. Betikler proje kurulunca `film/tools/` altına kopyalanır.

## Hangi ses
Kullanıcının kendi kaydı (sayfa belgeseli), AI ses (gençlik sayfası işleri) ya da şarkı.
Kural aşağıdaki "kendi kaydı" içindir; AI seste kesme, hız (1,1x), kazanç serbesttir.

**AI ses:** ElevenLabs API varsa `eleven.py` (`entegrasyonlar.md`): önce `sesler`, kısa örnek, kullanıcı seçer, sonra
`konus --metin metin.txt --ses <id> --out kayit/ham.wav --kelimeler kayit/kelimeler.json --onay`. Kelime zamanları hazır gelir,
2. adım atlanır, 3. adımdan devam edilir. API yoksa kullanıcının ElevenLabs sitesinden indirdiği sesler; o zaman 2. adım gerekir.
İfade etiketleri (`[dramatic]`, `[long pause]`) modele göre değişir: kısa örnekle dene. Kredi harcar: izin al.
Yedek: edge-tts tr-TR-AhmetNeural (7.3.1+; 7.2.8 403 veriyor).

## Kural (kullanıcının kendi kaydı)
Kullanıcının sesi olduğu gibi kalır: gürültü temizleme (DeepFilterNet kurulu ama KULLANILMAZ),
sıkıştırma, EQ, normalize, kelime kesme yok. Yalnızca uzun sessizlikler ve uzun nefesler
kısaltılır; bir kelime asla silinmez ya da kırpılmaz (ilk denemede "satamadığı" → "satamadı" oldu,
bu kabul edilmez). Seviye en sonda düz kazançla -14 LUFS.

## Adımlar (proje kökünden, `P=.../araclar/venv/Scripts/python.exe`)
1. **Kayıt** kullanıcıdan (telefon kaydı .mp4/.m4a olabilir) → `kayit/ham.wav`:
   `ffmpeg -i kayit.mp4 -vn -ac 1 -ar 48000 kayit/ham.wav`
2. **Kelime zamanları**: `$P -I film/tools/yaziya_dok.py kayit/ham.wav kayit/kelimeler.json --sozluk "özel adlar, virgülle"`
   (medium model, CPU int8; GPU'da cuBLAS eksik). Yanına numaralı `kelimeler.txt` yazar. Sayıları ve özel
   adları doğrula ("2025"i "2020 yaş" diye duydu).
3. **Kurgu ayarı** `kayit/kurgu.py` (proje kurulunca boş gelir, dolu örnek `film/tools/kurgu_ornegi.py`):
   - `CAPS`: `(ilk_kelime, son_kelime, "ALTYAZI")`, kullanıcının söylediği hâliyle, doğru yazımla
   - `SHOT_AT`: `("çekim", ilk_kelime)`; ilk çekim `("çekim", None)`. Adlar filmdeki `case "çekim"` ile aynı olmalı
   - `DROP`: atılacak kelimeler (sadece kullanıcının onayladığı tekrar/hata)
   - `KAPANIS`: son sözden sonraki süre (varsayılan 1,75 sn, kdKit kapanışı 52 kare)
4. **Oturt**: `$P -I film/tools/seslendirme_oturt.py kayit/ham.wav kayit/kelimeler.json film/src/canvas-core/<ad>.ts kayit/ses_kurgu.wav kayit/kurgu.py`
   Boşluk hedefleri: nokta 0,30 sn, virgül 0,18, diğer 0,10; kelime sonu +150 ms, başı -80 ms korunur,
   -38 dBFS kuyruk koruması, 15 ms çapraz geçiş. Filmdeki LINES, SHOTS, DURATION yeniden yazılır
   (kapanış payı dahil); bulamazsa hata verir, sessizce geçmez. Filmde olmayan çekimi uyarır.
5. **Render** (sessiz): `node tools/render.mjs <ad> --scale 1 --workers 8 --out out/<ad>_sessiz.mp4`
6. **Yatak**: `$P -I film/tools/sesmiks.py film/src/canvas-core/<ad>.ts <ses klasörü> film/out/yatak.wav kayit/efektler.py`
   Daktilo her harfte (LINES'tan; ses klasöründe `2842_daktilo_tus.flac`, `2843_daktilo_bosluk.flac` yoksa
   uyarır, sessiz yazar). Filmin efektleri `kayit/efektler.py`: `put`, `one`, `bedloop`, `typing`, `level`,
   `ambience`, `A("çekim")`, `B("çekim")`; dolu örnek `film/tools/efekt_ornegi.py`. Olmayan çekim istenirse hata verir.
7. **Ses + yatak**: `$P -I film/tools/ses_karistir.py film/out/yatak.wav kayit/ses_kurgu.wav film/out/mix.wav`
8. **Teslim**: `bash film/tools/birlestir.sh film/out/<ad>_sessiz.mp4 film/out/mix.wav film/out/<ad>_final.mp4`
   (-14 LUFS'a düz kazanç, tepe -1 dBTP'yi geçmez; son 1,6 sn söner, video sonuna kadar uzar; son konuşma
   sönmeden önce bitmeli, yoksa 4. argümanla kısalt). Ses videodan uzunsa render eski demektir: hata verir.
   Oturttuktan sonra render'ı YENİLE. Sonra `teslim.sh` ile teslim klasörüne koy.
9. **Doğrula**: `python film/tools/kontrol.py film/out/<ad>_final.mp4 --film film/src/canvas-core/<ad>.ts --max 89`
   ve final sesini `yaziya_dok.py` ile yazıya dök, her cümle sırasıyla duyuluyor mu karşılaştır.

## Sesi parçalara bölerken (bölme hatası)
`ffmpeg -i X -ss a -to b -af afade=...` filtreye orijinal zamanı verir: ilk cümle dışındakiler SESSİZ
çıktı ve kullanıcı yakaladı. Doğrusu: `ffmpeg -ss a -t d -i X -af asetpts=PTS-STARTPTS,afade=...`.
Her parçanın seviyesini (RMS) ölç; fısıltı gibi kısık parçalara ayrı kazanç ver. `alimiter` kullanırsan
`level=disabled` ver, yoksa seviyeyi kendi yükseltir. Örnek doğrulama: (örnek proje).

## Ölçülü ses geçişi (efekt ve müzik)
Claude duyamaz: sesi hissiyatla değerlendirme, "güzel oldu" deme. Ölç ve kullanıcıya dinlet.
(Yöntem: Barty-Bart/motion-graphics `sound-effects`, MIT; Vox'un ses geçişi yaklaşımı.)
1. Efekt listesi: her ses için an, tür, neden. Bir olaya bir ses; aynı türde farklı kayıt, tekrar robotik durur.
2. Zamanlama: görünme ve tıklama tam karede; hareket sesi 2 kare önce başlar; yükselen ses (riser)
   sonraki vuruşta BİTER; en güçlü efekt açılma anında.
3. Öncelik: konuşma > efekt > müzik. Müzik konuşma altında 8-12 dB kısılır.
4. Ölçümü ara dosyada değil, teslim MP4'ünde yap (`kontrol.py`); telefondan dinleneceği için tek kanal
   (mono) kontrolü de yap: `ffmpeg -i final.mp4 -ac 1 -af ebur128=peak=true -f null -`.
5. Müzikli işte vuruş ızgarasını doğrula: `vurus_izgara.py` (ara vuruşa kilitlenme olur); büyük kesme ve
   açılmalar vuruşa gelsin; oynatamıyorsan müziğin başlangıcını kaydır; hatayı ms olarak raporla.
6. Teslimde **en riskli 5 anı** yaz (saniye + neden): kullanıcı kulaklıkla onları kontrol etsin.
7. `CREDITS.txt`: kullanılan ses ve müziklerin kaynak ve lisansı. Platform itiraz ederse kanıt olur.
   Lisansı bilinmeyen sesi "muhtemelen sorun yok" diye kullanma. Yayından önce kaynağın güncel
   koşuluna bak: CC0 (Freesound, Kenney) serbest; Mixkit, Pixabay videoda serbest, dosyası dağıtılamaz.
Kullanıcı whoosh'u amatör buldu: bu listeden hareket sesi seçerken yumuşak olanı al ya da hiç koyma.

## Müzik (istenirse)
- `muzikmiks.py <film.ts> <yatak> <parça> <çıktı> --voice <ses> --vurus 103,83 --sessiz dark`: parçanın
  103. sn'sini filmin 83. sn'sine oturtur, `dark` çekiminde müziği keser, anlatım altında kısar. örnek filmde sonunda müzik
  kaldırıldı. Parça: ticari serbest, Content ID kayıtlı olmayan (Pixabay'de kontrol et), indirmeden
  önce izin al. Vuruşları `librosa` onset ile bul (bir işte kesmeler ±5 ms'ye oturtuldu).

## Efekt kaynakları
- CC0: BigSoundBank (izin verildi). örnek film seti: (örnek proje).
- media-use skill'i: `resolve --type sfx` (hesapsız, Openverse) ile yeni efekt bulma.
