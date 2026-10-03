-- شغّل هذا الملف مرة واحدة في Supabase → SQL Editor

create extension if not exists pgcrypto;

-- ========== الجداول ==========
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table if not exists news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  content text,
  image_url text,
  category text,
  published boolean default true,
  published_at date default current_date,
  created_at timestamptz default now()
);

create table if not exists gallery (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'image' check (type in ('image','video')),
  url text not null,
  title text,
  created_at timestamptz default now()
);

create table if not exists achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  category text,
  year int,
  created_at timestamptz default now()
);

create table if not exists bio_timeline (
  id uuid primary key default gen_random_uuid(),
  year text not null,
  title text not null,
  description text,
  kind text default 'position' check (kind in ('birth','education','position')),
  sort_order int default 0
);

-- صف واحد للإعدادات العامة
create table if not exists site_settings (
  id int primary key default 1 check (id = 1),
  stats jsonb default '[]'::jsonb,   -- [{"label":"مشروع منجز","value":120}]
  bio_text text,
  welcome text,
  phone text,
  email text,
  address text,
  social jsonb default '{}'::jsonb
);
insert into site_settings (id) values (1) on conflict do nothing;

create sequence if not exists request_seq start 10001;

create table if not exists citizen_requests (
  id uuid primary key default gen_random_uuid(),
  tracking_code text unique not null,
  name text not null check (char_length(name) between 2 and 120),
  phone text not null check (phone ~ '^[0-9+ -]{9,16}$'),
  province text not null check (char_length(province) <= 40),
  type text not null check (char_length(type) <= 40),
  details text not null check (char_length(details) between 5 and 4000),
  image_url text,
  status text not null default 'new' check (status in ('new','in_progress','done')),
  created_at timestamptz default now()
);

-- ========== دوال مساعدة ==========
create or replace function is_admin() returns boolean
language sql security definer stable as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

-- إنشاء رقم المتابعة تلقائياً: AG-2026-10001
create or replace function set_tracking_code() returns trigger
language plpgsql as $$
begin
  -- رقم غير قابل للتخمين: تسلسل + 4 أحرف عشوائية
  new.tracking_code := 'AG-' || to_char(now(), 'YYYY') || '-' || nextval('request_seq') || '-'
    || upper(substr(translate(encode(gen_random_bytes(6), 'base64'), '+/=Il0O', 'XYZWKMN'), 1, 4));
  new.status := 'new';
  return new;
end $$;

drop trigger if exists trg_tracking on citizen_requests;
create trigger trg_tracking before insert on citizen_requests
for each row execute function set_tracking_code();

-- تتبع الطلب بالرقم: يرجع الحالة فقط دون بيانات المواطن
create or replace function track_request(code text)
returns table (tracking_code text, status text, type text, created_at timestamptz)
language sql security definer as $$
  select r.tracking_code, r.status, r.type, r.created_at
  from citizen_requests r where upper(r.tracking_code) = upper(trim(code));
$$;
grant execute on function track_request(text) to anon, authenticated;

-- ========== الأمان (RLS) ==========
alter table admins enable row level security;
alter table news enable row level security;
alter table gallery enable row level security;
alter table achievements enable row level security;
alter table bio_timeline enable row level security;
alter table site_settings enable row level security;
alter table citizen_requests enable row level security;

create policy "admins self read" on admins for select using (user_id = auth.uid());

create policy "news public read" on news for select using (published or is_admin());
create policy "news admin write" on news for all using (is_admin()) with check (is_admin());

create policy "gallery public read" on gallery for select using (true);
create policy "gallery admin write" on gallery for all using (is_admin()) with check (is_admin());

create policy "ach public read" on achievements for select using (true);
create policy "ach admin write" on achievements for all using (is_admin()) with check (is_admin());

create policy "bio public read" on bio_timeline for select using (true);
create policy "bio admin write" on bio_timeline for all using (is_admin()) with check (is_admin());

create policy "settings public read" on site_settings for select using (true);
create policy "settings admin write" on site_settings for all using (is_admin()) with check (is_admin());

create policy "requests anyone insert" on citizen_requests for insert with check (true);
create policy "requests admin read" on citizen_requests for select using (is_admin());
create policy "requests admin update" on citizen_requests for update using (is_admin()) with check (is_admin());
create policy "requests admin delete" on citizen_requests for delete using (is_admin());

-- ========== التخزين ==========
insert into storage.buckets (id, name, public) values ('site', 'site', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('requests', 'requests', false) on conflict do nothing;

create policy "site public read" on storage.objects for select using (bucket_id = 'site');
create policy "site admin write" on storage.objects for all
  using (bucket_id = 'site' and is_admin()) with check (bucket_id = 'site' and is_admin());

create policy "requests anyone upload" on storage.objects for insert
  with check (bucket_id = 'requests');
create policy "requests admin read" on storage.objects for select
  using (bucket_id = 'requests' and is_admin());

-- ========== بعد إنشاء حساب الأدمن من Authentication → Users ==========
-- insert into admins (user_id) values ('UUID-الخاص-بالمستخدم');

-- جلب رقم المتابعة بعد الإدخال (لأن القراءة المباشرة للأدمن فقط)
create or replace function request_code_by_id(rid uuid) returns text
language sql security definer as $$
  select tracking_code from citizen_requests
  where id = rid and created_at > now() - interval '2 minutes';
$$;
grant execute on function request_code_by_id(uuid) to anon, authenticated;

-- ========== المعاملات المنجزة (صفحة عامة) ==========
create table if not exists completed_items (
  id uuid primary key default gen_random_uuid(),
  done_date date not null default current_date,
  ministry text not null,
  title text not null,          -- نوع المعاملة
  citizen_name text,            -- اختياري: يُنشر فقط بموافقة المواطن
  ref_no text,
  created_at timestamptz default now()
);
alter table completed_items enable row level security;
create policy "completed public read" on completed_items for select using (true);
create policy "completed admin write" on completed_items for all using (is_admin()) with check (is_admin());

-- إحصاءات عامة للصفحة الرئيسية (أرقام فقط دون بيانات شخصية)
create or replace function request_stats()
returns table (total bigint, done bigint, in_progress bigint)
language sql security definer as $$
  select count(*), count(*) filter (where status = 'done'), count(*) filter (where status = 'in_progress')
  from citizen_requests;
$$;
grant execute on function request_stats() to anon, authenticated;

-- ========== تشديد الأمان ==========
-- 1) حماية من الإغراق (spam): حد أقصى 40 طلباً كل 10 دقائق للموقع كله
create or replace function throttle_requests() returns trigger
language plpgsql security definer as $$
begin
  if (select count(*) from citizen_requests where created_at > now() - interval '10 minutes') >= 40 then
    raise exception 'too many requests';
  end if;
  return new;
end $$;
drop trigger if exists trg_throttle on citizen_requests;
create trigger trg_throttle before insert on citizen_requests for each row execute function throttle_requests();

-- 2) مرفقات المواطنين: صور فقط وبحجم أقصى 5MB
update storage.buckets set file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp']
where id = 'requests';
update storage.buckets set file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif']
where id = 'site';
