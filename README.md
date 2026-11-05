# 🎬 Animasyon Stüdyosu

Claude Code için tam donanımlı bir video stüdyosu. Gerçek yayınlarda, gerçek müşteri işlerinde pişti. Fikri söylüyorsun; araştırmadan bitmiş videoya kadar bütün hattı yürütüyor.

*A full video studio skill for Claude Code, in Turkish: from idea to finished vertical video.*

## 🔥 Neden diğerlerinden farklı?

- 🏭 **Tek araç değil, bütün stüdyo.** Çoğu skill sadece animasyon ya da sadece kurgu yapar. Bu; araştırma, metin, çizim, ses, kurgu ve teslimi tek hatta birleştirir.
- 🧠 **Her işte öğrenir.** Beğenilmeyen her şey zevk profiline yazılır, sonraki işte önce oraya bakılır.
- ✅ **Sana gelmeden kendini denetler.** Her aşamanın kalite kapısı var; video önce sert bir yönetmen gibi puanlanır, sonra otomatik teslim kontrolünden geçer.
- 🎯 **Sadece 5 onay.** Brif, deneme karesi, metin, sahne listesi, final. Gerisini kendisi karar verir.
- 🎙️ **Sese saygılı.** Kaydındaki boşlukları kısaltır, kelimene dokunmaz; sahneleri ve altyazıları söylediğin kelimeye oturtur.
- 🔍 **Yanlış bilgiye sıfır tolerans.** Her bilginin kaynağı tutulur, doğrulanmayan bilgi metne girmez.
- 🛠️ **Sahada test edildi.** Gerçek kayıtla uçtan uca çalıştırıldı, gerçek hatalar yakalanıp kapatıldı.

## 🎨 Hangi işleri yapar?

- 🖌️ **Çizim animasyonu:** mürekkep-laviş, kalem, suluboya, masal kitabı, sumi-e, kömür, gravür ve 32 tarz
- 📐 **2D ve grafik:** flat vektör, izometrik kesit, kinetik yazı, çizgi roman, kâğıt kesik, gazete baskı, piksel
- 😂 **Karikatür ve parodi:** karakterli kısa animasyon, sesten otomatik ağız hareketi
- 🧊 **3D:** low-poly, Three.js, Blender
- 🤖 **Gerçekçi AI video:** Flow/Veo ile müşteri filmleri, kare ve geçiş dersleriyle
- 🎞️ **Harman:** AI klip + kodla çizilmiş hareketli grafik
- 📰 **Belgesel ve haber:** araştırma, hikâye kurgusu, merak döngülü metin
- ✂️ **Kurgu:** referans video analizi, vuruşa kesme, ara kare, ağır çekim, özne ayırma
- 🔊 **Ses:** seslendirme oturtma, daktilo, ortam, efekt, müzik miksi, -14 LUFS teslim
- 🏷️ **Marka:** logo işleme, açılış ve kapanış, birden fazla sayfa ve müşteri

## ⚡ Kurulum

Önce Claude Code, Git, Node.js, Python ve FFmpeg kurulu olsun. Sonra:

```bash
git clone https://github.com/TR-KOBRA/animasyon-studyosu.git
cd animasyon-studyosu
bash kur.sh
```

Kendi sesinle anlatımlı video yapacaksan `bash kur.sh --ses` kullan (yaklaşık 650 MB). Betik, çizim motoru [anidoodle](https://github.com/alexgreensh/anidoodle)'ı orijinal deposundan indirir. Yeni sürüme geçmek için: `bash kur.sh --guncelle`.

İsteğe bağlı araçlar: `~/araclar/venv_goruntu` içinde `scenedetect`, `rembg[cpu,cli]`; `~/araclar/rhubarb` ve `~/araclar/rife` (Windows sürümleri). Klasör farklıysa `ARACLAR` ortam değişkenini ver. Birlikte çalıştığı skill'ler: hyperframes, media-use, humanizer.

Windows üzerinde Git Bash ile denendi. Başka sistemlerde yollar değişebilir.

## 🔌 Bağlantılar

Sistem işe göre neyin bağlı olduğuna bakar, en iyi sonuç için ne eklemen gerektiğini söyler:

```bash
python animasyon-studyosu/scripts/baglan.py durum
python animasyon-studyosu/scripts/baglan.py oneri gercekci
```

- 🎙️ **ElevenLabs:** anlatım, efekt ve müzik doğrudan API ile. `python animasyon-studyosu/scripts/baglan.py ekle elevenlabs`
- 🎥 **Gemini Omni Flash:** API ile AI video (ayrı ücretlidir). `python animasyon-studyosu/scripts/baglan.py ekle gemini`
- 🌊 **Google Flow:** herkese açık API'si yok, kendi aboneliğinle tarayıcıdan kullanılır.

🔐 Anahtarını Claude'a yazma: kendi terminaline gir. Sadece kendi bilgisayarında, depo dışında durur. Para harcayan her üretim önce sorar, `--onay` olmadan istek gitmez.

## Başlangıç
Claude Code'da "yeni bir video yapalım" demen yeterli. Elle proje kurmak için:

```bash
bash ~/.claude/skills/animasyon-studyosu/scripts/yeni_proje.sh ornek --tarz wren
```

## Kendine uyarla
`references/zevk-profili.md` ve `references/sayfalar.md` boş gelir: kendi tercihlerin ve markaların için doldur. Logo dosyası dahil değildir: `film/assets/logo_renkli.png` ve `logo_beyaz.png` koyup kitte `logo` ayarını aç.

## Bilinen sınırlar
- Gerçek işlerde en çok mürekkep-laviş, karikatür ve Flow/Veo yolu kullanıldı. Three.js ve Blender yolları yazılı ama henüz videoda denenmedi.
- `vurus_izgara.py` seyrek vuruşlu parçalarda güvenilir değil.
- Claude ses dinleyemez: sonuçları ölçer, kulak kontrolü sende.
- ElevenLabs ve Gemini araçları resmî belgelere göre yazıldı, sahte sunucuyla test edildi; gerçek hesapla ilk denemede küçük bir örnekle başla.

## Lisans
MIT (`LICENSE`). anidoodle'dan türeyen üç şablon dosyası Apache-2.0 altında kalır: `NOTICE` ve `LICENSES/Apache-2.0.txt`.
