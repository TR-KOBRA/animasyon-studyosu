"""Özneyi arka plandan ayırır (yerelde, dosya dışarı gitmez): şeffaf PNG verir. Kare klasörü de alır.
Kullanım alanı: yazının öznenin arkasından geçmesi, derinlik katmanı, kapak. Karanlık ya da özneyle
aynı renkte zeminde kenarı kontrol et. Videoda her kare ayrı kesildiği için kenar titreyebilir.

usage: <araclar>/venv_goruntu/Scripts/python.exe -I ozne_ayir.py <girdi.png|klasor> <cikti.png|klasor> [model=u2net]
Modeller: u2net (genel), u2net_human_seg (insan), isnet-anime (çizim). Farklı model ilk kullanımda iner: izin al.
"""
import glob, os, sys
from PIL import Image
from rembg import remove, new_session

src, dst = sys.argv[1:3]
s = new_session(sys.argv[3] if len(sys.argv) > 3 else "u2net")
if os.path.isdir(src):
    os.makedirs(dst, exist_ok=True)
    for f in sorted(glob.glob(src + "/*.png")): remove(Image.open(f), session=s).save(os.path.join(dst, os.path.basename(f)))
else: remove(Image.open(src), session=s).save(dst)
print("hazır:", dst)
