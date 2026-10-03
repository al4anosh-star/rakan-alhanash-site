#!/bin/sh
# نسخة احتياطية من قاعدة البيانات والصور. الاستخدام: sh scripts/backup.sh
cd "$(dirname "$0")/.." && mkdir -p backups && tar czf "backups/site-$(date +%F-%H%M).tgz" server/data && echo "تم: backups/"
