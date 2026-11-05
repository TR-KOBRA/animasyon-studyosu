# Dış repo haritası (Kasım 2026 araştırması)

Yıldız, lisans ve son güncelleme GitHub'dan 05.11.2026'da okundu. Deneme makinesi: 6 GB VRAM'li dizüstü ekran kartı. Kurmadan önce kullanıcıdan izin al ve boş alanı söyle.
Durum: **önerildi** = henüz kurulmadı.

## Kuruldu (05.11.2026, gerçek dosyalarda denendi)
| Araç | Yer | Test sonucu |
|---|---|---|
| PySceneDetect 0.7.2 | `~/araclar/venv_goruntu` | örnek filmde 36 çekimin 30'unu buldu, 24 sn |
| rembg (u2net) | `venv_goruntu` | Karanlık Veo karesinde traktörü temiz ayırdı, ~10 sn/kare (ilk çalışmada model iner) |
| Rhubarb 1.14.0 (MIT) | `~/araclar/rhubarb` | 16 sn Türkçe sesi 2 sn'de işledi, 112 ağız ipucu; animasyonda görsel olarak henüz denenmedi |
| RIFE 20221029 (MIT) | `~/araclar/rife` | 3 sn Veo klibi 24 → 30 fps, 6 sn (`-g 1` = RTX 4050); hızlı akan arka plan bulanıklaşıyor |
| `vurus_izgara.py` (librosa) | skill `scripts/` | Tek denemesi seyrek vuruşlu gerilim parçası (bir parodi m2): ara vuruş uyarısı verdi, kapanışa konan vuruşu 184 ms uzak gösterdi. Düzenli vuruşlu parçada henüz sınanmadı; sonucuna körü körüne güvenme |

## Sıradaki adaylar
| Repo | Yıldız · Lisans · Son | Ne işe yarar | Bizdeki yeri |
|---|---|---|---|
| m-bain/whisperX | 25k · BSD-2 · 10.2026 | kelime zamanlarını hizalar | altyazı ve kesme hassasiyeti; Türkçe hizalama önce denenmeli; ağır bağımlılık, ayrı venv |
| CPJKU/beat_this | 466 · MIT · 05.2026 | müzik vuruşu bulma | librosa'dan iyi mi diye bir şarkıda karşılaştır |
| gl-transitions/gl-transitions | 2,2k · lisansı kontrol et · 11.2026 | GLSL geçiş koleksiyonu | sadece özel istekte; hazır geçiş kullanıcı zevkine ters olabilir |
| acamposuribe/p5.brush | 1,3k · MIT · 10.2026 | doğal fırça, leke, tarama | yeni el çizimi tarzları; p5.js LGPL, film koduna uyarlanmalı |
| steveruizok/perfect-freehand | 5,8k · MIT · 04.2026 | basınçlı serbest el çizgisi | karikatür ve el yazısı konturu; tek küçük paket |
| rough-stuff/rough | 21k · MIT · 07.2024 | eskiz görünümlü şekil | hızlı kroki, ok ve daire işaretleri |
| patriciogonzalezvivo/lygia | 3,5k · lisansı kontrol et · 10.2026 | shader kütüphanesi (grain, gürültü) | Three.js işinde |
| pmndrs/postprocessing | 3k · Zlib · 11.2026 | Three.js sonrası efektler | Three.js işinde |

## Skill'ler (kurmak yerine önce okunup fikir alınır; tetiklenme çakışması olmasın)
| Repo | Durum | Alınacak fikir |
|---|---|---|
| Barty-Bart/motion-graphics | 1,1k, MIT olduğu belirtiliyor, 10.2026 | Fikirleri `ses.md`'ye aktarıldı. CC0 ses seti henüz indirilmedi; `sfx/manifest.json` kaynaklarıyla birlikte aday |
| charlie947/motion-graphics-skills | 559, MIT | `reference-to-motion` ve `vox-explainer` fikirleri `is-akisi.md`, `sahne-tasarimi.md`, `hikaye-ve-metin.md` içine aktarıldı |
| dylantarre/animation-principles | 141, MIT | Disney'in 12 ilkesini kod diline çevirme; çok parçalı (144 skill), tek ilke listesi çıkarmak yeter |
| remotion-dev/skills | 6,4k | HyperFrames ile aynı iş; sadece gerekirse |

## Önerilmeyenler (nedeniyle)
- Remotion: şirket kullanımında ücretli lisans olabilir; HyperFrames + anidoodle aynı işi görüyor.
- Yerel AI video/3D (ComfyUI, Wan, LTX-Video, TRELLIS, Hunyuan3D): 6 GB VRAM ile çalıştırmak zor, disk ister. Flow devam.
- Wav2Lip: lisans belirsiz, gerçek yüz dudak senkronu (yüz kuralımıza ters). SadTalker aynı.
- stable-ts ve google-research/frame-interpolation: arşivlenmiş.
- Spine, Rive gibi rig araçları: ücretli ya da editör gerektiriyor; `bitRig.ts`, `cheetahRig.ts` örnekleri var.
- GSAP doğrudan kurulum gerekmez, HyperFrames içinde geliyor. OpenMontage: ağır, AGPL.
- auto-editor: sessizlik kesiyor; kullanıcının sesi için `seslendirme_oturt.py` daha güvenli.
