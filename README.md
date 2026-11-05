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

## Kurulum
1. `animasyon-studyosu` klasörünü `~/.claude/skills/` altına kopyala.
2. Gerekenler: Claude Code, Node.js, Python 3.11, FFmpeg, Playwright Chromium ve [anidoodle](https://github.com/alexgreensh/anidoodle) skill'i (`~/.claude/skills/anidoodle`).
3. Ses için: `~/araclar/venv` içinde `faster-whisper`, `numpy`, `librosa`.
4. İsteğe bağlı: `~/araclar/venv_goruntu` içinde `scenedetect[opencv]`, `rembg[cpu,cli]`; `~/araclar/rhubarb` ve `~/araclar/rife` (Windows sürümleri). Klasör farklıysa `ARACLAR` ortam değişkenini ver.
5. Birlikte çalıştığı skill'ler (isteğe bağlı): hyperframes, media-use, humanizer.

Betikler Windows üzerinde Git Bash ile denendi. Başka sistemlerde ara araç yolları değişebilir.

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

## Lisans
Apache-2.0. Bkz. `LICENSE` ve `NOTICE`.
