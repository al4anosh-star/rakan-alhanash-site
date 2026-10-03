// خادم الموقع المستقل: Node + SQLite (مدمج بـ Node، بدون أي حزم خارجية ولا حسابات)
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'

const __dir = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dir, '..')
const DATA = path.join(__dir, 'data')
const PUB = path.join(DATA, 'uploads')          // صور الموقع (عامة)
const PRIV = path.join(DATA, 'private')         // مرفقات المواطنين (خاصة)
fs.mkdirSync(PUB, { recursive: true }); fs.mkdirSync(PRIV, { recursive: true })

// ---------- إعدادات ----------
const cfgFile = path.join(DATA, 'config.json')
let cfg = fs.existsSync(cfgFile) ? JSON.parse(fs.readFileSync(cfgFile, 'utf8')) : {}
if (!cfg.secret) {
  cfg.secret = crypto.randomBytes(32).toString('hex')
  cfg.adminPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(5).toString('hex')
  fs.writeFileSync(cfgFile, JSON.stringify(cfg, null, 2))
  console.log('\n=== بيانات دخول لوحة التحكم (تظهر مرة واحدة) ===\n  المستخدم: admin\n  كلمة السر: ' + cfg.adminPassword + '\n  (محفوظة في server/data/config.json)\n')
}
if (process.env.ADMIN_PASSWORD) cfg.adminPassword = process.env.ADMIN_PASSWORD
const PORT = Number(process.env.PORT || 8787)
const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN || cfg.telegramToken
const TG_CHAT = process.env.TELEGRAM_CHAT_ID || cfg.telegramChat

// ---------- قاعدة البيانات ----------
const db = new DatabaseSync(path.join(DATA, 'site.db'))
db.exec(`
create table if not exists news (id text primary key, title text not null, summary text, content text, image_url text, category text, published int default 1, published_at text, created_at text default (datetime('now')));
create table if not exists gallery (id text primary key, type text default 'image', url text not null, title text, created_at text default (datetime('now')));
create table if not exists achievements (id text primary key, title text not null, description text, image_url text, category text, year int, created_at text default (datetime('now')));
create table if not exists bio_timeline (id text primary key, year text, title text not null, description text, kind text default 'position', sort_order int default 0);
create table if not exists completed_items (id text primary key, done_date text, ministry text, title text, citizen_name text, ref_no text, created_at text default (datetime('now')));
create table if not exists site_settings (id int primary key, stats text default '[]', bio_text text, welcome text, phone text, email text, address text, social text default '{}');
create table if not exists citizen_requests (id text primary key, tracking_code text unique, name text, phone text, province text, type text, details text, image_url text, status text default 'new', created_at text default (datetime('now')));
create table if not exists counters (k text primary key, v int);
`)
const TABLES = {
  news: ['title', 'summary', 'content', 'image_url', 'category', 'published', 'published_at'],
  gallery: ['type', 'url', 'title'],
  achievements: ['title', 'description', 'image_url', 'category', 'year'],
  bio_timeline: ['year', 'title', 'description', 'kind', 'sort_order'],
  completed_items: ['done_date', 'ministry', 'title', 'citizen_name', 'ref_no'],
  citizen_requests: ['status'],
}
const ORDER = { news: 'published_at desc, created_at desc', gallery: 'created_at desc', achievements: 'created_at desc', bio_timeline: 'sort_order asc', completed_items: 'done_date desc, created_at desc', citizen_requests: 'created_at desc' }

// بذر البيانات الأولية عند أول تشغيل
if (!db.prepare('select 1 from site_settings').get()) {
  const { demo } = await import('../src/lib/demo.js')
  const { site } = await import('../src/config/site.js')
  const id = () => crypto.randomUUID()
  db.prepare('insert into site_settings (id,stats,bio_text,welcome,phone,email,address,social) values (1,?,?,?,?,?,?,?)')
    .run(JSON.stringify(demo.settings.stats), demo.settings.bio_text, site.welcome, site.phone, site.email, site.address, JSON.stringify(site.social))
  for (const n of demo.news) db.prepare('insert into news (id,title,summary,content,image_url,category,published,published_at) values (?,?,?,?,?,?,1,?)').run(id(), n.title, n.summary, n.content, n.image_url, n.category, n.published_at)
  for (const g of demo.gallery) db.prepare('insert into gallery (id,type,url,title) values (?,?,?,?)').run(id(), g.type, g.url, g.title)
  for (const a of demo.achievements) db.prepare('insert into achievements (id,title,description,image_url,category,year) values (?,?,?,?,?,?)').run(id(), a.title, a.description, a.image_url, a.category, a.year)
  demo.timeline.forEach((t, i) => db.prepare('insert into bio_timeline (id,year,title,description,kind,sort_order) values (?,?,?,?,?,?)').run(id(), t.year, t.title, t.description, t.kind, i))
  for (const c of demo.completed) db.prepare('insert into completed_items (id,done_date,ministry,title) values (?,?,?,?)').run(id(), c.done_date, c.ministry, c.title)
  console.log('تم إدخال البيانات الأولية.')
}

// ---------- أدوات ----------
const sign = (p) => { const b = Buffer.from(JSON.stringify(p)).toString('base64url'); return b + '.' + crypto.createHmac('sha256', cfg.secret).update(b).digest('base64url') }
const verify = (t) => {
  try {
    const [b, s] = String(t).split('.')
    const ok = crypto.timingSafeEqual(Buffer.from(s), Buffer.from(crypto.createHmac('sha256', cfg.secret).update(b).digest('base64url')))
    const p = JSON.parse(Buffer.from(b, 'base64url').toString())
    return ok && p.exp > Date.now() ? p : null
  } catch { return null }
}
const SEC = { 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'strict-origin-when-cross-origin' }
const send = (res, code, body, headers = {}) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...SEC, ...headers }); res.end(JSON.stringify(body)) }
const readBody = (req, limit = 12e6) => new Promise((ok, no) => {
  let n = 0; const chunks = []
  req.on('data', (c) => { n += c.length; if (n > limit) { no(new Error('too large')); req.destroy() } else chunks.push(c) })
  req.on('end', () => { try { ok(chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {}) } catch (e) { no(e) } })
})
const isAdmin = (req) => verify((req.headers.authorization || '').replace('Bearer ', ''))
const rate = new Map()
const limited = (ip, key, max, ms) => { const k = key + ip, now = Date.now(); const a = (rate.get(k) || []).filter((t) => now - t < ms); a.push(now); rate.set(k, a); return a.length > max }
const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2' }
const saveImage = (dir, dataUrl) => {
  const m = /^data:image\/(png|jpe?g|webp|gif);base64,(.+)$/.exec(dataUrl || '')
  if (!m) throw new Error('صيغة الصورة غير مدعومة')
  const buf = Buffer.from(m[2], 'base64'); if (buf.length > 8e6) throw new Error('الصورة كبيرة')
  const name = Date.now() + '-' + crypto.randomBytes(4).toString('hex') + '.' + m[1].replace('jpeg', 'jpg')
  fs.writeFileSync(path.join(dir, name), buf); return name
}
const parse = (r) => r && ({ ...r, ...(r.stats !== undefined ? { stats: JSON.parse(r.stats || '[]'), social: JSON.parse(r.social || '{}') } : {}), ...(r.published !== undefined ? { published: !!r.published } : {}) })

async function notifyTelegram(r) {
  if (!TG_TOKEN || !TG_CHAT) return
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  const text = `📨 <b>طلب جديد من مواطن</b>\n\n🔢 <b>رقم المتابعة:</b> ${r.tracking_code}\n👤 <b>الاسم:</b> ${esc(r.name)}\n📞 <b>الهاتف:</b> ${esc(r.phone)}\n📍 <b>المحافظة:</b> ${esc(r.province)}\n📂 <b>النوع:</b> ${esc(r.type)}\n\n${esc(r.details.slice(0, 600))}${r.image_url ? '\n\n📎 يوجد مرفق (يظهر في لوحة التحكم)' : ''}`
  try { await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: TG_CHAT, text, parse_mode: 'HTML' }) }) } catch {}
}

// ---------- المسارات ----------
async function api(req, res, url) {
  const p = url.pathname, m = req.method
  const ip = (process.env.TRUST_PROXY && String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()) || req.socket.remoteAddress
  const q = Object.fromEntries(url.searchParams)

  if (m === 'GET' && p === '/api/settings') return send(res, 200, parse(db.prepare('select * from site_settings where id=1').get()))
  if (m === 'GET' && p === '/api/news') {
    let sql = 'select * from news where published=1', a = []
    if (q.category) { sql += ' and category=?'; a.push(q.category) }
    sql += ' order by ' + ORDER.news + (q.limit ? ' limit ' + (parseInt(q.limit) || 10) : '')
    return send(res, 200, db.prepare(sql).all(...a).map(parse))
  }
  let mm
  if (m === 'GET' && (mm = p.match(/^\/api\/news\/([\w-]+)$/))) return send(res, 200, parse(db.prepare('select * from news where id=? and published=1').get(mm[1])) || null)
  if (m === 'GET' && (mm = p.match(/^\/api\/list\/(gallery|achievements|bio_timeline|completed_items)$/))) return send(res, 200, db.prepare(`select * from ${mm[1]} order by ${ORDER[mm[1]]}`).all())
  if (m === 'GET' && p === '/api/stats') {
    const r = db.prepare("select count(*) total, sum(status='done') done, sum(status='in_progress') in_progress from citizen_requests").get()
    return send(res, 200, { total: r.total, done: r.done || 0, in_progress: r.in_progress || 0 })
  }
  if (m === 'GET' && p === '/api/track') {
    const r = db.prepare('select tracking_code,status,type,created_at from citizen_requests where upper(tracking_code)=upper(?)').get(String(q.code || '').trim())
    return send(res, 200, r || null)
  }
  if (m === 'POST' && p === '/api/requests') {
    if (limited(ip, 'req', 5, 3600e3)) return send(res, 429, { error: 'عدد كبير من الطلبات، حاول لاحقاً' })
    const b = await readBody(req)
    for (const k of ['name', 'phone', 'province', 'type', 'details']) if (!String(b[k] || '').trim()) return send(res, 400, { error: 'بيانات ناقصة' })
    if (!/^[0-9+\s-]{9,16}$/.test(b.phone)) return send(res, 400, { error: 'رقم الهاتف غير صحيح' })
    const image = b.image ? saveImage(PRIV, b.image) : null
    const n = (db.prepare("select v from counters where k='req'").get()?.v ?? 10000) + 1
    db.prepare("insert into counters (k,v) values ('req',?) on conflict(k) do update set v=excluded.v").run(n)
    const row = { id: crypto.randomUUID(), tracking_code: `AG-${new Date().getFullYear()}-${n}-${crypto.randomBytes(3).toString('base64url').replace(/[^A-Za-z0-9]/g, 'X').slice(0, 4).toUpperCase()}`, name: b.name.trim().slice(0, 120), phone: b.phone.trim(), province: b.province, type: b.type, details: b.details.trim().slice(0, 4000), image_url: image }
    db.prepare('insert into citizen_requests (id,tracking_code,name,phone,province,type,details,image_url) values (?,?,?,?,?,?,?,?)').run(...Object.values(row))
    notifyTelegram(row)
    return send(res, 200, { code: row.tracking_code })
  }
  if (m === 'POST' && p === '/api/login') {
    if (limited(ip, 'login', 8, 900e3)) return send(res, 429, { error: 'محاولات كثيرة، حاول بعد قليل' })
    const b = await readBody(req)
    const a = Buffer.from(String(b.password || '')), c = Buffer.from(cfg.adminPassword)
    if (b.username === 'admin' && a.length === c.length && crypto.timingSafeEqual(a, c)) return send(res, 200, { token: sign({ exp: Date.now() + 12 * 3600e3 }) })
    return send(res, 401, { error: 'بيانات الدخول غير صحيحة' })
  }

  // ----- الأدمن -----
  if (p.startsWith('/api/admin')) {
    if (!isAdmin(req)) return send(res, 401, { error: 'غير مصرّح' })
    if (m === 'GET' && p === '/api/admin/me') return send(res, 200, { ok: true })
    if (m === 'GET' && (mm = p.match(/^\/api\/admin\/file\/([\w.-]+)$/))) {
      const f = path.join(PRIV, path.basename(mm[1])); if (!fs.existsSync(f)) return send(res, 404, {})
      res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); return fs.createReadStream(f).pipe(res)
    }
    if (m === 'POST' && p === '/api/admin/upload') {
      const b = await readBody(req); return send(res, 200, { url: '/uploads/' + saveImage(PUB, b.data) })
    }
    if (m === 'PUT' && p === '/api/admin/settings') {
      const b = await readBody(req)
      db.prepare('update site_settings set stats=?,bio_text=?,welcome=?,phone=?,email=?,address=?,social=? where id=1')
        .run(JSON.stringify(b.stats || []), b.bio_text ?? null, b.welcome ?? null, b.phone ?? null, b.email ?? null, b.address ?? null, JSON.stringify(b.social || {}))
      return send(res, 200, { ok: true })
    }
    if ((mm = p.match(/^\/api\/admin\/(\w+)(?:\/([\w-]+))?$/)) && TABLES[mm[1]]) {
      const [, t, id] = mm, cols = TABLES[t]
      if (m === 'GET') return send(res, 200, db.prepare(`select * from ${t} order by ${ORDER[t]}`).all().map(parse))
      if (m === 'POST') {
        const b = await readBody(req)
        const vals = cols.map((c) => (typeof b[c] === 'boolean' ? +b[c] : b[c] ?? null))
        if (b.id) db.prepare(`update ${t} set ${cols.map((c) => c + '=?').join(',')} where id=?`).run(...vals, b.id)
        else if (t !== 'citizen_requests') db.prepare(`insert into ${t} (id,${cols.join(',')}) values (?,${cols.map(() => '?').join(',')})`).run(crypto.randomUUID(), ...vals)
        return send(res, 200, { ok: true })
      }
      if (m === 'DELETE' && id) { db.prepare(`delete from ${t} where id=?`).run(id); return send(res, 200, { ok: true }) }
    }
  }
  return send(res, 404, { error: 'not found' })
}

// ---------- الخادم + الملفات الثابتة ----------
const DIST = path.join(ROOT, 'dist')
http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x')
  try {
    if (url.pathname.startsWith('/api/')) return await api(req, res, url)
    if (url.pathname.startsWith('/uploads/')) {
      const f = path.join(PUB, path.basename(url.pathname))
      if (fs.existsSync(f)) { res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'public, max-age=31536000' }); return fs.createReadStream(f).pipe(res) }
    }
    let f = path.join(DIST, decodeURIComponent(url.pathname))
    if (!f.startsWith(DIST) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(DIST, 'index.html')
    const headers = { ...SEC, 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }
    if (f.includes('/assets/')) headers['Cache-Control'] = 'public, max-age=31536000, immutable'
    res.writeHead(200, headers); fs.createReadStream(f).pipe(res)
  } catch (e) { send(res, 500, { error: 'خطأ في الخادم' }); console.error(e) }
}).listen(PORT, process.env.HOST || '0.0.0.0', () => console.log(`الخادم يعمل: http://localhost:${PORT}`))
