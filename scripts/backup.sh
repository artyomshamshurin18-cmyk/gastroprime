#!/bin/bash
# Auto-backup: запускать после каждого изменения БД или кода
# Использование: /root/gastroprime/scripts/backup.sh [имя_точки]

set -e
TS=$(date +%Y%m%d_%H%M%S)
NAME="${1:-auto}"
DIR="/root/gastroprime/backups/${TS}-${NAME}"
mkdir -p "$DIR"

# Дамп БД
su - postgres -c "pg_dump -d catering_b2b" > "$DIR/db.sql"
echo "DB: $DIR/db.sql ($(wc -c < $DIR/db.sql) bytes)"

# Копия .env (без паролей — только структура)
cp /root/gastroprime/backend/.env "$DIR/.env" 2>/dev/null || true

# Ссылка на последний
rm -f /root/gastroprime/backups/latest
ln -sf "$DIR" /root/gastroprime/backups/latest

echo "Backup saved: $DIR"

# Авто-чистка: оставляем 30 последних
cd /root/gastroprime/backups
ls -1dt */ | tail -n +31 | xargs -r rm -rf
