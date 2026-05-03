#!/usr/bin/env python3
"""
Отправка email-рассылок Gastroprime через Mailopost SMTP
Использует HTML-шаблоны email_v1_pain, email_v2_solution, email_v3_push
"""
import smtplib
import ssl
import csv
import json
import time
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dataclasses import dataclass
from typing import Optional

SMTP_HOST = "smtp.msndr.net"
SMTP_PORT = 587  # STARTTLS
SMTP_USER = "info@gastroprime.ru"
SMTP_PASS = "f920c91f0150484d3ba0dfa191d2a315"
FROM_NAME = "Gastroprime"
FROM_EMAIL = "info@gastroprime.ru"

# Путь к шаблонам писем
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATES = {
    "pain": os.path.join(BASE_DIR, "email_v1_pain.html"),
    "solution": os.path.join(BASE_DIR, "email_v2_solution.html"),
    "push": os.path.join(BASE_DIR, "email_v3_push.html"),
}
SUBJECTS = {
    "pain": "Вы теряете до 30 000 руб/мес на обедах сотрудников. И не замечаете",
    "solution": "5 минут в день вместо Excel — как это выглядит на деле",
    "push": "Последнее письмо: бесплатный тест-драйв на 7 дней. Или остаётесь с Excel",
}
COMPANIES_CSV = os.path.join(BASE_DIR, "moscow_companies_gastroprime.csv")

@dataclass
class Company:
    name: str = ""
    contact_person: str = ""
    email: str = ""
    phone: str = ""
    employees: int = 0
    industry: str = ""
    address: str = ""

def load_companies(csv_path: str) -> list[Company]:
    companies = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            companies.append(Company(
                name=row.get('company_name', '') or row.get('name', ''),
                contact_person=row.get('contact_person', '') or row.get('contact', ''),
                email=row.get('email', ''),
                phone=row.get('phone', ''),
                employees=int(row.get('employees', 0) or 0),
                industry=row.get('industry', ''),
                address=row.get('address', ''),
            ))
    return companies

def personalise_html(html: str, company: Company) -> str:
    """Персонализирует HTML: подставляет имя компании и контактного лица"""
    name = company.contact_person or company.name or "Коллеги"
    html = html.replace("{company.name}", company.name)
    html = html.replace("{company.contact_person}", company.contact_person or company.name or "Коллеги")
    html = html.replace("{company.employees}", str(company.employees))
    html = html.replace("{company.industry}", company.industry)
    html = html.replace("{company.address}", company.address)
    return html

def send_email(to_email: str, to_name: str, html: str, subject: str) -> bool:
    """Отправляет одно письмо через Mailopost SMTP"""
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"{FROM_NAME} <{FROM_EMAIL}>"
        msg['To'] = f"{to_name} <{to_email}>"
        msg.attach(MIMEText(html, 'html', 'utf-8'))

        ctx = ssl.create_default_context()
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
            server.ehlo()
            server.starttls(context=ctx)
            server.ehlo()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(FROM_EMAIL, [to_email], msg.as_string())
        return True
    except Exception as e:
        print(f"❌ {to_email}: {e}")
        return False

def load_template(template_type: str) -> str:
    """Загружает HTML шаблон письма"""
    path = TEMPLATES.get(template_type)
    if not path or not os.path.exists(path):
        print(f"⚠️ Шаблон {template_type} не найден ({path})")
        return ""
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def send_campaign(template_type: str = "pain", limit: int = None, delay: float = 3.0, start_from: int = 0):
    """Отправляет кампанию по базе компаний"""
    companies = load_companies(COMPANIES_CSV)
    if limit:
        companies = companies[start_from:start_from + limit]
    else:
        companies = companies[start_from:]

    html_template = load_template(template_type)
    if not html_template:
        return 0, 0

    subject = SUBJECTS.get(template_type, "Gastroprime — питание сотрудников под контролем")

    print(f"📧 Кампания: {template_type}")
    print(f"📋 Компаний: {len(companies)}")
    print(f"⏱ Задержка: {delay}s")
    print()

    success, fail = 0, 0
    for i, company in enumerate(companies, 1):
        if not company.email or company.email == '-' or '@' not in company.email:
            print(f"[{start_from + i}/{len(companies)}] ⏭ {company.name}: нет email")
            continue

        html = personalise_html(html_template, company)

        print(f"[{start_from + i}/{len(companies)}] 📤 {company.name} → {company.email}...", end=" ", flush=True)
        if send_email(company.email, company.contact_person or company.name, html, subject):
            print("✅")
            success += 1
        else:
            fail += 1

        if i < len(companies):
            time.sleep(delay)

    print(f"\n📊 Итог: ✅ {success} отправлено, ❌ {fail} ошибок")
    return success, fail

if __name__ == "__main__":
    import sys
    mode = sys.argv[1] if len(sys.argv) > 1 else "test"
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else None
    start = int(sys.argv[3]) if len(sys.argv) > 3 else 0

    if mode == "test":
        # Тест на себя со всеми 3 шаблонами
        for t in ["pain", "solution", "push"]:
            html = load_template(t)
            ok = send_email("info@gastroprime.ru", "Артём", html, f"🧪 {SUBJECTS[t]}")
            print(f"{'✅' if ok else '❌'} {t}: {SUBJECTS[t][:50]}...")
            time.sleep(2)
    elif mode == "pain":
        send_campaign("pain", limit, 3.0, start)
    elif mode == "solution":
        send_campaign("solution", limit, 3.0, start)
    elif mode == "push":
        send_campaign("push", limit, 3.0, start)
    elif mode == "chain":
        # Полная цепочка: боль → решение → дожим
        parts = [(l := int(sys.argv[2]) if len(sys.argv) > 2 else 50, 0)]
        if limit:
            parts = [(limit, start)]
        print(f"🚀 Запуск цепочки из 3 писем ({parts[0][0]} компаний)")
        for t in ["pain", "solution", "push"]:
            s, f = send_campaign(t, parts[0][0], 3.0, start)
            time.sleep(60)  # пауза между письмами
    else:
        print("Использование: python3 mailopost_sender.py [test|pain|solution|push|chain] [limit] [start]")
        print("  test     — тест на info@gastroprime.ru (все 3 письма)")
        print("  pain     — рассылка письма #1 (боль)")
        print("  solution — рассылка письма #2 (решение)")
        print("  push     — рассылка письма #3 (дожим)")
        print("  chain    — цепочка из 3 писем последовательно")
        print("  limit    — ограничить получателей")
        print("  start    — начать с N-го контакта")
