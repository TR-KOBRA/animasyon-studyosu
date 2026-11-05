# Bir filmin efektleri: sesmiks.py bunu 4. argüman olarak çalıştırır.
# Elinde hazır: A(çekim) başı, B(çekim) sonu, put(ses, sn, dB), one(dosya, baş, uzunluk), bedloop, typing, level, ambience, norm, trim, load, onset, SHOTS.
level(0.5, A("card"), -24)                                  # ortam sesi seviyesi
ambience("ortam.flac", "lowpass=f=700,highpass=f=120")      # tüm filme yayılan ortam
put(one("sayfa.ogg", 0.0, 0.9), A("card"), -12)             # çekime bağlı tek efekt
bedloop("sokak.flac", A("steppe"), B("steppe"), -18)        # tek çekimlik atmosfer
typing("2026", A("card") + 0.1, 0.5, -19)                   # sahne içi yazının daktilo sesi
