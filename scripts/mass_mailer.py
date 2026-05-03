#!/usr/bin/env python3
"""Массовая рассылка Gastroprime — запускается Смитом"""
import smtplib, ssl, sys, os, time, json
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime

SMTP_SERVER = "smtp.msndr.net"
SMTP_PORT = 587
SMTP_USER = "info@gastroprime.ru"
SMTP_PASS = "f920c91f0150484d3ba0dfa191d2a315"

EMAILS_DIR = os.path.dirname(os.path.abspath(__file__))
PROGRESS_FILE = os.path.join(EMAILS_DIR, "mailer_progress.json")

def load_emails():
    """Загружает список email-ов из всех файлов в папке leads/"""
    emails = set()
    leads_dir = os.path.join(EMAILS_DIR, "leads")
    if not os.path.exists(leads_dir):
        print(f"❌ Папка leads/ не найдена в {EMAILS_DIR}")
        return []
    for fname in sorted(os.listdir(leads_dir)):
        if fname.endswith(".txt"):
            fpath = os.path.join(leads_dir, fname)
            with open(fpath) as f:
                for line in f:
                    line = line.strip().lower()
                    if "@" in line:
                        emails.add(line)
    return sorted(emails)

def load_template(version):
    """Загружает HTML шаблон письма"""
    fname = {1: "email_v1_pain.html", 2: "email_v2_solution.html", 3: "email_v3_push.html"}[version]
    fpath = os.path.join(EMAILS_DIR, fname)
    if not os.path.exists(fpath):
        print(f"❌ Шаблон не найден: {fpath}")
        return None
    with open(fpath) as f:
        return f.read()

def load_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE) as f:
            return json.load(f)
    return {"batch": 1, "sent": {}, "errors": []}

def save_progress(data):
    with open(PROGRESS_FILE, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def send_email(to_email, html, subject):
    msg = MIMEMultipart("alternative")
    msg["From"] = SMTP_USER
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(html, "html"))
    ctx = ssl.create_default_context()
    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=15) as s:
            s.starttls(context=ctx)
            s.login(SMTP_USER, SMTP_PASS)
            s.sendmail(SMTP_USER, [to_email], msg.as_string())
        return True
    except Exception as e:
        return str(e)

def run_batch(version, email_list, batch_size=50, delay=3):
    """Отправляет batch_size писем, ждёт delay секунд, продолжает"""
    subjects = {
        1: "Вы теряете до 30 000 ₽/мес на обедах. И не замечаете.",
        2: "Обеды без Excel: как не потерять 2 дня в месяц",
        3: "Бесплатный тест-драйв Gastroprime — последнее предложение"
    }
    
    progress = load_progress()
    if progress["batch"] > version:
        print(f"📬 Письмо #{version} уже отправлено. Пропускаю.")
        return
    
    template = load_template(version)
    if not template:
        return
    
    subject = subjects[version]
    sent_count = 0
    errors = []
    
    print(f"\n📬 Отправляю письмо #{version}: {subject}")
    print(f"   База: {len(email_list)} контактов")
    print(f"   Партия: {batch_size} писем, пауза {delay}с\n")
    
    for i, email in enumerate(email_list):
        if email in progress["sent"]:
            continue
        
        result = send_email(email, template, subject)
        if result is True:
            progress["sent"][email] = datetime.now().isoformat()
            sent_count += 1
            sys.stdout.write(f"\r   ✅ [{i+1}/{len(email_list)}] {email[:30]}...")
            sys.stdout.flush()
        else:
            errors.append({"email": email, "error": result})
            sys.stdout.write(f"\r   ❌ [{i+1}/{len(email_list)}] {email[:30]}... {result[:40]}")
            sys.stdout.flush()
        
        if sent_count > 0 and sent_count % batch_size == 0:
            save_progress(progress)
            print(f"\n   ⏸️ Пауза {delay}с после {sent_count} писем...")
            time.sleep(delay)
    
    save_progress(progress)
    print(f"\n\n✅ Письмо #{version} завершено: {sent_count} отправлено, {len(errors)} ошибок")
    return errors

if __name__ == "__main__":
    print("📬 Массовая рассылка Gastroprime")
    print("================================")
    
    version = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    batch_size = int(sys.argv[2]) if len(sys.argv) > 2 else 50
    delay = int(sys.argv[3]) if len(sys.argv) > 3 else 3
    
    emails = load_emails()
    if not emails:
        print("❌ База email-ов пуста")
        sys.exit(1)
    
    print(f"📊 Загружено {len(emails)} уникальных email-ов")
    
    if version == 0:
        versions = [1, 2, 3]
    else:
        versions = [version]
    
    for v in versions:
        run_batch(v, emails, batch_size, delay)
    
    print("\n🎉 Рассылка завершена!")
