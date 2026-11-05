# Hareket, efekt ve geçiş haritası

Bunların hepsi zaten kurulu. Sıfırdan yazmadan önce buraya bak. Yollar `~/.claude/skills` altında;
motor kodları proje kurulunca `film/src/canvas-core/` içinde de bulunur.

## Hangi etki için nereye bakılır

| İstenen | Kodla film (anidoodle) | HTML hattı (hyperframes) |
|---|---|---|
| Sahneden sahneye anlamlı geçiş | `anidoodle/references/motion-grammar.md` (6 mekanizma, hazır dikişler, hareketi taşıyan kesmeler) | `hyperframes-animation` blueprints: `camera-journey`, `spatial-pan-stations`, `zoom-out-workspace-reveal` |
| Fırça silme, iris, flaş kesme | `transitions.ts`: `brushWipe`, `iris`, `flashCut`; `checkFlashes` flaş sıklığını denetler | rule `scale-swap-transition`, `theme-crossfade-morph`; shader-transitions |
| Şekilden şekle dönüşüm | `morph.ts` (örnek film `morphDemo`) | rule `card-morph-anchor` |
| Kamera, parallaks, lens | `anidoodle/references/camera.md` (derinlik düzlemleri, lens ve dolly) | rule `multi-phase-camera`, `coordinate-target-zoom`, `depth-of-field-blur` |
| Ağır çekim, dondurma | `timeRemap.ts` (`anidoodle/references/camera.md`): zaman eğrisi, dondururken yazı akmaya devam eder | – |
| Sarsıntı, darbe | `anidoodle/references/camera.md` `shake`: ekran pikseliyle genlik, yumuşak gürültü, sönümlü | rule `physics-press-reaction` |
| Kinetik yazı, vuruşa oturan yazı | `kinetic.ts` (örnek `kineticDemo`) | rule `kinetic-beat-slam`, `discrete-text-sequence`; blueprint `kinetic-type-beats`, `typewriter-reveal` |
| Okunan kelime parlasın | – | rule `asr-keyword-glow` |
| Sayaç, rakam, grafik | – | rule `counting-dynamic-scale`, `stat-bars-and-fills`; blueprint `dataviz-countup` |
| Logo kurulma, kapanış | kdKit | blueprint `logo-assemble-lockup`, `titlecard-reveal`, `cta-morph-press` |
| Parçacık, patlama | – | rule `particle-burst`, `depth-scatter-assemble` |
| Glitch, renk kayması, hız izi | – | rule `chromatic-glitch`, `motion-blur-streak`, `ambient-glow-bloom` |
| Çizgiyle çizilme | anidoodle `workflows/drawing-process.md` | rule `svg-path-draw` |
| 3D kamera, derinlikli yazı | low-poly tarzı | rule `3d-camera-flight`, `3d-text-depth-layers`, `orbit-3d-entry` |
| Gerçek hareket bulanıklığı | `render.mjs --blur auto` | – |
| Efekt sesi | `anidoodle/references/music/sound-design.md`: 14 katmanlı efekt, kareye bağlı, sesi kısan miks (`node tools/sfx.mjs list`) | hyperframes-audio |
| Hazır görsel blok (grain, CRT, harita…) | – | `hyperframes-registry` (~400 parça): elle yazmadan önce ara |

HTML hattının kuralları GSAP/HTML içindir. Kodla filmde kullanırken kodu değil zamanlama ve hareket
mantığını al; Harman işinde ise doğrudan HyperFrames katmanı olarak render edip birleştir.

## Ölçü
- Filmde bir ya da iki geçiş mekanizması; hepsi aynı filmde gösteri makarası gibi durur.
- Efekt hikâyeden çıkmalı. Sarsıntı gerçek darbede, flaş hemen hiç (kullanıcı "güneş doğuyor" dedi),
  whoosh yok. Gençlere yönelik işte punch-in ve pop serbest; belgeselde yavaş itme.
- `anidoodle/references/motion-grammar.md` içindeki "Names we refuse" listesi kaçınılacak hazır efektleri yazar.
