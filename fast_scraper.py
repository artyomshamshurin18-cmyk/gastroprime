#!/usr/bin/env python3
import json, re, time, ssl
from urllib.request import Request, urlopen

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
H = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

def fetch(url):
    try:
        req = Request(url, headers=H)
        resp = urlopen(req, timeout=6, context=ctx)
        return resp.read().decode("utf-8", errors="replace")
    except:
        try:
            req = Request(url.replace("https://","http://"), headers=H)
            resp = urlopen(req, timeout=6, context=ctx)
            return resp.read().decode("utf-8", errors="replace")
        except:
            return None

def get_emails(html):
    if not html: return set()
    s = set()
    for e in re.findall(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", html):
        e = e.lower().strip()
        if any(x in e for x in ["example","test@","domain.com","yourmail","demo@","help@2gis"]) or "@" not in e or "." not in e.split("@")[1]:
            continue
        s.add(e)
    return s

import sys
f = sys.argv[1]
out = sys.argv[2] if len(sys.argv) > 2 else f.replace(".txt","_result.txt")

with open(f) as fh:
    sites = [l.strip() for l in fh if l.strip() and not l.startswith("#")]

results = {}
for i, site in enumerate(sites, 1):
    if not site: continue
    dom = site.replace("https://","").replace("http://","").split("/")[0]
    print(f"[{i}/{len(sites)}] {dom:35s}", end=" ", flush=True)
    emails = set()
    for path in ["/","/contacts","/contact","/kontakty","/about","/o-nas"]:
        html = fetch(f"https://{dom}{path}")
        emails.update(get_emails(html))
        if len(emails) > 10: break
        time.sleep(0.2)
    if emails:
        results[dom] = sorted(emails)
        print(f"OK {len(emails)}")
    else:
        print("--")

with open(out, "w") as fh:
    for dom, emails in sorted(results.items()):
        for e in emails:
            fh.write(f"{e}\n")

print(f"\nDone: {len(results)} sites, {sum(len(v) for v in results.values())} emails")
