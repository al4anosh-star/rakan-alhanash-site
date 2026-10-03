# نشر الموقع

## المتطلبات
- سيرفر Linux (VPS) بذاكرة 1GB تكفي، مثل Hetzner أو DigitalOcean أو أي مزوّد.
- نطاق (دومين) موجّه بسجل A إلى IP السيرفر.
- Docker مثبّت على السيرفر.

## الخطوات
```sh
# 1) انسخ فولدر المشروع إلى السيرفر (scp أو git)
# 2) داخل الفولدر:
DOMAIN=example.iq ADMIN_PASSWORD='كلمة-سر-قوية' docker compose up -d --build
```
بعد دقيقة يعمل الموقع على `https://example.iq` مع شهادة HTTPS تلقائية.
لوحة التحكم: `https://example.iq/admin` — المستخدم `admin`.

لإشعارات تلغرام أضف `TELEGRAM_BOT_TOKEN` و`TELEGRAM_CHAT_ID` في نفس الأمر.

## بدون Docker
```sh
npm ci && VITE_BACKEND=local npm run build
ADMIN_PASSWORD='...' TRUST_PROXY=1 node server/index.js   # المنفذ 8787 خلف nginx أو Caddy
```

## الصيانة
- البيانات كلها في `server/data` (قاعدة البيانات + الصور). خذ نسخة احتياطية بـ `sh scripts/backup.sh` يومياً (cron).
- التحديث: `docker compose up -d --build` (البيانات تبقى لأنها بـ volume).
