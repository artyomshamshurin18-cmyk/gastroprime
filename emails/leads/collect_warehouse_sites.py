import sys, re, json, time, ssl
from urllib.request import Request, urlopen

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

# Ищем через разные поисковые запросы
queries = [
    "складской+комплекс+Химки+сайт",
    "складской+комплекс+Мытищи+сайт",
    "складской+комплекс+Долгопрудный+сайт",
    "складской+комплекс+Лобня+сайт",
    "складской+комплекс+Королёв+сайт",
    "складской+комплекс+Пушкино+сайт",
    "складской+комплекс+Дмитров+сайт",
    "складской+комплекс+Щёлково+сайт",
    "складской+комплекс+Клин+сайт",
    "складской+комплекс+Зеленоград+сайт",
    "складской+комплекс+Солнечногорск+сайт",
    "складской+комплекс+Ивантеевка+сайт",
    "складской+комплекс+Балашиха+сайт",
    "складской+комплекс+Реутов+сайт",
    "складской+комплекс+Фрязино+сайт",
    "складской+комплекс+Красноармейск+сайт",
    "логистический+парк+север+Московской+области",
    "логистический+парк+Шереметьево+сайт",
    "складской+парк+Дмитровское+шоссе",
    "складской+парк+Ленинградское+шоссе",
    "складской+парк+Ярославское+шоссе",
    "складской+комплекс+Рогачёвское+шоссе",
    "PNK+парк+север",
    "MLP+логистический+парк",
    "склады+класса+А+север+МО",
    "производственно+складской+комплекс+север+МО",
    "склад+ответственного+хранения+север+МО",
    "логистический+центр+север+МО",
    "склады+в+аренду+север+МО+сайт",
]

all_sites = set()

for q in queries:
    url = f"https://www.google.com/search?q={q}&hl=ru&num=20"
    try:
        req = Request(url, headers=HEADERS)
        resp = urlopen(req, timeout=8, context=ctx)
        html = resp.read().decode("utf-8", errors="replace")
        
        # Вытаскиваем ссылки
        sites = re.findall(r"https?://(?:www\\.)?([a-zA-Z0-9.-]+\\.[a-z]{2,})(?:/[^\\s\"]*)?", html)
        for s in sites:
            s = s.lower().strip(".")
            # Фильтруем
            if any(x in s for x in ["google", "youtube", "facebook", "vk.com", "instagram", "yandex", "2gis"]):
                continue
            if s.count(".") >= 1:
                all_sites.add(s)
    except Exception as e:
        pass
    time.sleep(0.5)

# Сохраняем
with open("warehouse_sites_north_mo.txt", "w") as f:
    for s in sorted(all_sites):
        f.write(f"{s}\n")

print(f"Найдено сайтов: {len(all_sites)}")
for s in sorted(all_sites):
    print(f"  {s}")
