import { supabase, isConfigured, isLocal } from './supabase'
import { demo } from './demo'

const fail = (error) => { if (error) throw error }

// ---------- الخادم المحلي المستقل (server/index.js) ----------
const tok = () => { try { return localStorage.getItem('adm_token') || '' } catch { return '' } }
async function http(method, path, body, auth) {
  const r = await fetch(path, {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(auth ? { Authorization: 'Bearer ' + tok() } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j.error || 'خطأ في الاتصال')
  return j
}
const toDataUrl = (file) => new Promise((ok, no) => { const f = new FileReader(); f.onload = () => ok(f.result); f.onerror = no; f.readAsDataURL(file) })
// ضغط الصور قبل الرفع لتسريع الموقع
async function shrink(file, max = 1600) {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return toDataUrl(file)
  const img = await createImageBitmap(file)
  const k = Math.min(1, max / Math.max(img.width, img.height))
  const c = document.createElement('canvas'); c.width = img.width * k; c.height = img.height * k
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
  return c.toDataURL('image/jpeg', 0.85)
}

// ---------- قراءة عامة ----------
export async function getSettings() {
  if (isLocal) return http('GET', '/api/settings')
  if (!isConfigured) return demo.settings
  const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle()
  fail(error)
  return data || demo.settings
}

export async function getNews({ limit, category } = {}) {
  if (isLocal) return http('GET', '/api/news?' + new URLSearchParams({ ...(limit ? { limit } : {}), ...(category ? { category } : {}) }))
  if (!isConfigured) {
    let r = demo.news
    if (category) r = r.filter((n) => n.category === category)
    return limit ? r.slice(0, limit) : r
  }
  let q = supabase.from('news').select('*').eq('published', true).order('published_at', { ascending: false })
  if (category) q = q.eq('category', category)
  if (limit) q = q.limit(limit)
  const { data, error } = await q
  fail(error)
  return data
}

export async function getNewsItem(id) {
  if (isLocal) return http('GET', '/api/news/' + id)
  if (!isConfigured) return demo.news.find((n) => n.id === id) || null
  const { data, error } = await supabase.from('news').select('*').eq('id', id).maybeSingle()
  fail(error)
  return data
}

export async function getList(table) {
  if (isLocal) return http('GET', '/api/list/' + table)
  if (!isConfigured) return demo[table === 'bio_timeline' ? 'timeline' : table === 'completed_items' ? 'completed' : table] || []
  const order = table === 'bio_timeline' ? 'sort_order' : table === 'completed_items' ? 'done_date' : 'created_at'
  const { data, error } = await supabase.from(table).select('*').order(order, { ascending: table === 'bio_timeline' })
  fail(error)
  return data
}

export async function getRequestStats() {
  if (isLocal) return http('GET', '/api/stats').catch(() => null)
  if (!isConfigured) return null
  const { data, error } = await supabase.rpc('request_stats')
  if (error || !data?.[0]) return null
  return data[0]
}

// ---------- رفع الملفات ----------
export async function uploadFile(bucket, file) {
  if (isLocal) return (await http('POST', '/api/admin/upload', { data: await shrink(file) }, true)).url
  if (!isConfigured) throw new Error('Supabase غير مربوط بعد')
  const ext = file.name.split('.').pop()
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: '31536000' })
  fail(error)
  if (bucket === 'site') return supabase.storage.from('site').getPublicUrl(path).data.publicUrl
  return path
}

export async function signedUrl(path) {
  if (isLocal) {
    if (!path) return null
    const r = await fetch('/api/admin/file/' + path, { headers: { Authorization: 'Bearer ' + tok() } })
    return r.ok ? URL.createObjectURL(await r.blob()) : null
  }
  if (!path || !isConfigured) return null
  const { data } = await supabase.storage.from('requests').createSignedUrl(path, 3600)
  return data?.signedUrl || null
}

// ---------- طلبات المواطنين ----------
export async function submitRequest(form, file) {
  if (isLocal) return (await http('POST', '/api/requests', { ...form, image: file ? await shrink(file, 1400) : null })).code
  if (!isConfigured) {
    await new Promise((r) => setTimeout(r, 600))
    return 'AG-2026-DEMO1'
  }
  const image_url = file ? await uploadFile('requests', file) : null
  const id = crypto.randomUUID()
  // لا نستخدم select بعد الإدخال لأن القراءة للأدمن فقط؛ رقم المتابعة يُولَّد بالتريغر
  // لذلك ننشئ الطلب ثم نجلب الرقم عبر دالة آمنة
  const { error } = await supabase.from('citizen_requests').insert({ ...form, image_url, tracking_code: 'pending', id })
  fail(error)
  const { data, error: e2 } = await supabase.rpc('request_code_by_id', { rid: id })
  fail(e2)
  return data
}

export async function trackRequest(code) {
  if (isLocal) return http('GET', '/api/track?code=' + encodeURIComponent(code))
  if (!isConfigured) return { tracking_code: code.toUpperCase(), status: 'in_progress', type: 'طلب خدمة', created_at: new Date().toISOString() }
  const { data, error } = await supabase.rpc('track_request', { code })
  fail(error)
  return data?.[0] || null
}

// ---------- الأدمن ----------
// وضع المعاينة: بدون Supabase تعمل اللوحة على بيانات في الذاكرة (تضيع عند تحديث الصفحة)
const mem = {
  citizen_requests: [
    { id: 'r1', tracking_code: 'AG-2026-10001', name: 'علي حسن', phone: '07701234567', province: 'بغداد', type: 'طلب خدمة', details: 'نطلب صيانة الشارع الرئيسي في المنطقة وإنارته.', status: 'new', created_at: '2026-10-01T10:00:00Z' },
    { id: 'r2', tracking_code: 'AG-2026-10002', name: 'زينب كاظم', phone: '07801234567', province: 'البصرة', type: 'شكوى', details: 'شكوى بخصوص تأخر معاملة التقاعد.', status: 'in_progress', created_at: '2026-09-29T09:00:00Z' },
    { id: 'r3', tracking_code: 'AG-2026-10003', name: 'محمد جاسم', phone: '07901234567', province: 'نينوى', type: 'طلب مساعدة', details: 'طلب مساعدة لعائلة متعففة.', status: 'done', created_at: '2026-09-20T12:00:00Z' },
  ],
  news: demo.news.map((n) => ({ ...n, published: true })),
  completed_items: demo.completed.map((x) => ({ ...x, created_at: x.done_date })),
  gallery: [...demo.gallery], achievements: [...demo.achievements], bio_timeline: [...demo.timeline],
}
export const adminList = async (table, order = 'created_at') => {
  if (isLocal) return http('GET', '/api/admin/' + table, null, true)
  if (!isConfigured) return [...(mem[table] || [])]
  const { data, error } = await supabase.from(table).select('*').order(order, { ascending: false })
  fail(error)
  return data
}
export async function adminSave(table, row) {
  if (isLocal) return http('POST', '/api/admin/' + table, row, true)
  const { id, ...rest } = row
  if (!isConfigured) {
    const a = mem[table]
    const i = a.findIndex((x) => x.id === id)
    if (i >= 0) a[i] = { ...a[i], ...rest }; else a.unshift({ ...rest, id: 'm' + Date.now() })
    return
  }
  const q = id ? supabase.from(table).update(rest).eq('id', id) : supabase.from(table).insert(rest)
  const { error } = await q
  fail(error)
}
export async function adminDelete(table, id) {
  if (isLocal) return http('DELETE', `/api/admin/${table}/${id}`, null, true)
  if (!isConfigured) { mem[table] = mem[table].filter((x) => x.id !== id); return }
  const { error } = await supabase.from(table).delete().eq('id', id)
  fail(error)
}
export async function saveSettings(row) {
  if (isLocal) return http('PUT', '/api/admin/settings', row, true)
  if (!isConfigured) return
  const { error } = await supabase.from('site_settings').upsert({ ...row, id: 1 })
  fail(error)
}
export async function localLogin(username, password) {
  const { token } = await http('POST', '/api/login', { username, password })
  localStorage.setItem('adm_token', token)
}
export const localLogout = () => { try { localStorage.removeItem('adm_token') } catch {} }
export async function isAdminUser() {
  if (isLocal) return http('GET', '/api/admin/me', null, true).then(() => true).catch(() => false)
  if (!isConfigured) return true
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data } = await supabase.from('admins').select('user_id').eq('user_id', user.id).maybeSingle()
  return Boolean(data)
}
