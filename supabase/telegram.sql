-- إشعار تلغرام عند وصول طلب جديد
-- شغّل هذا الملف في Supabase → SQL Editor بعد schema.sql
-- (لا يحتاج Edge Functions: الإرسال يتم من قاعدة البيانات مباشرة عبر pg_net)

create extension if not exists pg_net with schema extensions;

-- جدول أسرار خاص: RLS مفعّل ولا توجد أي سياسة، فلا يقرأه أحد من الموقع
create table if not exists app_secrets (
  key text primary key,
  value text not null
);
alter table app_secrets enable row level security;

create or replace function notify_telegram() returns trigger
language plpgsql security definer set search_path = public, extensions as $$
declare
  tok text;
  chat text;
  msg text;
begin
  select value into tok  from app_secrets where key = 'telegram_bot_token';
  select value into chat from app_secrets where key = 'telegram_chat_id';
  if tok is null or chat is null then return new; end if;

  msg := '📨 <b>طلب جديد من مواطن</b>' || E'\n\n'
      || '🔢 <b>رقم المتابعة:</b> ' || new.tracking_code || E'\n'
      || '👤 <b>الاسم:</b> ' || replace(replace(new.name, '<', '&lt;'), '&', '&amp;') || E'\n'
      || '📞 <b>الهاتف:</b> ' || new.phone || E'\n'
      || '📍 <b>المحافظة:</b> ' || new.province || E'\n'
      || '📂 <b>النوع:</b> ' || new.type || E'\n\n'
      || replace(replace(left(new.details, 600), '&', '&amp;'), '<', '&lt;')
      || case when new.image_url is not null then E'\n\n📎 يوجد مرفق (يظهر في لوحة التحكم)' else '' end;

  perform net.http_post(
    url := 'https://api.telegram.org/bot' || tok || '/sendMessage',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object('chat_id', chat, 'text', msg, 'parse_mode', 'HTML')
  );
  return new;
exception when others then
  return new; -- فشل الإشعار لا يمنع حفظ الطلب أبداً
end $$;

drop trigger if exists trg_notify_telegram on citizen_requests;
create trigger trg_notify_telegram after insert on citizen_requests
for each row execute function notify_telegram();

-- ========== ضع بياناتك هنا (مرة واحدة) ==========
-- insert into app_secrets (key, value) values
--   ('telegram_bot_token', 'ضع-توكن-البوت-من-BotFather'),
--   ('telegram_chat_id',   'ضع-رقم-المجموعة-أو-المحادثة')
-- on conflict (key) do update set value = excluded.value;
