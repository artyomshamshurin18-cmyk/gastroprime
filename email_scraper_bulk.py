#!/usr/bin/env python3
"""Mass email scraper for company websites"""
import sys, json, re, time, ssl
from urllib.request import Request, urlopen
from email.utils import parseaddr
from bs4 import BeautifulSoup

SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

def fetch(url, timeout=8):
    try:
        req = Request(url, headers=HEADERS)
        resp = urlopen(req, timeout=timeout, context=SSL_CTX)
        return resp.read().decode("utf-8", errors="replace")
    except:
        try:
            url2 = url.replace("https://", "http://")
            req = Request(url2, headers=HEADERS)
            resp = urlopen(req, timeout=timeout, context=SSL_CTX)
            return resp.read().decode("utf-8", errors="replace")
        except:
            return None

def find_emails(html):
    if not html:
        return set()
    raw = re.findall(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", html)
    obf = re.findall(r"[a-zA-Z0-9._%+-]+\s*\[?at\]?\s*[a-zA-Z0-9.-]+\s*\[?dot\]?\s*[a-z]{2,}", html)
    emails = set()
    skip = {"example", "test@", "@domain", "help@2gis", "yourmail", "demo@", "admin@domain"}
    for e in raw + obf:
        e = e.lower().strip()
        e = e.replace(" [at] ", "@").replace("[at]", "@").replace(" (at) ", "@")
        e = e.replace(" [dot] ", ".").replace("[dot]", ".").replace(" (dot) ", ".")
        if any(x in e for x in skip) or "@" not in e or "." not in e.split("@")[1]:
            continue
        if len(e) > 5:
            emails.add(e)
    return emails

def process(domain):
    if not domain.startswith("http"):
        domain = f"https://{domain.strip()}"
    base = domain.split("//")[1].split("/")[0]
    emails = set()
    pages = [f"https://{base}/contacts", f"https://{base}/contact", f"https://{base}/kontakty", f"https://{base}/about", f"https://{base}/o-nas", f"https://{base}/", f"https://{base}/feedback"]
    for p in pages:
        html = fetch(p)
        emails.update(find_emails(html))
        time.sleep(0.3)
        if len(emails) > 10:
            break
    clean = set()
    for e in emails:
        e = e.lower().strip()
        if any(x in e for x in ["example", "test@", "domain.com", "yourmail", "demo@", "help@2gis", "admin@domain"]):
            continue
        if "@" in e and "." in e.split("@")[1]:
            clean.add(e)
    return sorted(clean)

if __name__ == "__main__":
    import os, glob
    input_file = sys.argv[1] if len(sys.argv) > 1 else "/root/gastroprime/emails/leads/sites_to_scrape.txt"
    output = sys.argv[2] if len(sys.argv) > 2 else "/root/gastroprime/emails/leads/scraped_results.txt"
    with open(input_file) as f:
        domains = [l.strip() for l in f if l.strip() and not l.startswith("#") and not l.startswith("http")]
    if not domains:
        domains = [l.strip() for l in f if l.strip() and not l.startswith("#")]
    # cleanup
    clean_domains = []
    for d in domains:
        d = d.replace("https://","").replace("http://","")
        if d and d not in clean_domains:
            clean_domains.append(d)
    all_emails = {}
    for i, dom in enumerate(clean_domains, 1):
        print(f"[{i}/{len(clean_domains)}] {dom:35s}", end=" ", flush=True)
        emails = process(dom)
        if emails:
            all_emails[dom] = emails
            print(f"OK {len(emails)}")
        else:
            print("--")
    flat = set()
    with open(output, "w") as f:
        for dom, emails in sorted(all_emails.items()):
            f.write(f"--- {dom} ---\n")
            for e in emails:
                f.write(f"{e}\n")
                flat.add(e)
            f.write("\n")
    flat_name = output.replace(".txt", "_flat.txt")
    with open(flat_name, "w") as f:
        for e in sorted(flat):
            f.write(f"{e}\n")
    print(f"\nTotal: {len(flat)} emails from {len(all_emails)} sites")
