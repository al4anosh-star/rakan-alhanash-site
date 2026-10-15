// يجلب منشورات حساب المكتب العلني على انستغرام ويجهّز أخباراً جديدة للمراجعة (لا ينشر شيئاً بنفسه).
// الاستخدام:  node scripts/fetch-news.mjs [--dry]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const DRY = process.argv.includes('--dry')
const PROFILE = process.env.IG_PROFILE || 'rakan__alhanash'
const UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
const AUTO = path.join(ROOT, 'src/data/news-auto.js')
const IMG_DIR = path.join(ROOT, 'public/img/news')
const SIG = '\n\nالمكتب الإعلامي للنائب راكان الشيخ صباح غازي الحنش — عضو لجنة النزاهة.'

const known = new Set(JSON.parse(readFileSync(path.join(ROOT, 'scripts/known-posts.json'), 'utf8')))
const readAuto = () => JSON.parse(readFileSync(AUTO, 'utf8').replace(/^[\s\S]*?export default\s*/, ''))
const auto = readAuto()
auto.news.forEach((n) => known.add(n.id.replace(/^a/, '')))

const res = await fetch(`https://www.instagram.com/${PROFILE}/`, { headers: { 'User-Agent': UA, 'Accept-Language': 'ar' } })
const html = await res.text()
console.log('HTTP', res.status, html.length, 'bytes')

// استخراج عقد المنشورات من JSON المضمّن في الصفحة
const posts = []
for (const m of html.matchAll(/\{"node":\{"__typename":"XIGPolaris/g)) {
  let depth = 0, i = m.index, inStr = false, esc = false
  for (; i < html.length; i++) {
    const c = html[i]
    if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; continue }
    if (c === '"') inStr = true
    else if (c === '{') depth++
    else if (c === '}' && --depth === 0) break
  }
  try {
    const n = JSON.parse(html.slice(m.index, i + 1)).node
    if (n?.caption?.text) posts.push(n)
  } catch {}
}
console.log('posts parsed:', posts.length)
if (!posts.length) { console.log('لم يُعثر على منشورات (قد تكون الصفحة محجوبة).'); process.exit(0) }

const fresh = posts.filter((p) => !known.has(String(p.pk)))
console.log('new posts:', fresh.length)

const pick = (cands) => {
  const ok = (cands || []).filter((c) => c.width <= 1440).sort((a, b) => b.width - a.width)
  return (ok[0] || (cands || [])[0] || {}).url
}
const dateOf = (pk) => new Date(Number((BigInt(pk) >> 23n)) + 1314220021721).toISOString().slice(0, 10)
const clean = (t) => t.replace(/[⁦-⁩]/g, '').trim()
const stripSig = (t) => clean(t).split(/\n\s*المكتب الإعلامي للنائب|\n\s*النائب راكان الشيخ صباح غازي الحنش\s*\nالمكتب الاعلامي/)[0].trim()
const category = (t) => (/تهنئة|بمناسبة|تعزية|بيان/.test(t) ? 'بيانات' : /زار|زيارة/.test(t) ? 'زيارات ميدانية' : /لقاء|التقى|استقبل/.test(t) ? 'لقاءات' : 'نشاطات')
const titleOf = (t) => {
  let s = stripSig(t).split(/[.\n]/)[0].replace(/(عضو لجنة النزاهة( النيابية)?\s*)?(النائب )?راكان الشيخ صباح غازي الحنش[،,]?\s*/g, 'النائب راكان الحنش ').replace(/\s+/g, ' ').trim()
  s = s.split(/(?:[،,]\s*|\s+)(?:جرى|حيث|لبحث|بهدف|في زيارة|في لقاء|في إطار)\s/)[0].replace(/[،,]\s*$/, '')
  return s.length > 95 ? s.slice(0, 92).replace(/\s\S*$/, '') + '…' : s
}

if (!DRY) mkdirSync(IMG_DIR, { recursive: true })
for (const p of fresh.sort((a, b) => Number(BigInt(a.pk) - BigInt(b.pk)))) {
  const urls = p.carousel_media?.length ? p.carousel_media.map((c) => pick(c.image_versions2?.candidates)) : [pick(p.image_versions2?.candidates)]
  const files = []
  for (const [i, u] of urls.filter(Boolean).entries()) {
    const name = `ig-${p.pk}-${i}.jpg`
    if (!DRY) writeFileSync(path.join(IMG_DIR, name), Buffer.from(await (await fetch(u)).arrayBuffer()))
    files.push(name)
  }
  const text = stripSig(p.caption.text)
  const title = titleOf(p.caption.text)
  const date = dateOf(p.pk)
  console.log(`+ ${date} | ${title} | ${files.length} صورة`)
  auto.news.unshift({
    id: `a${p.pk}`, title, summary: text.split(/[.\n]/)[0].slice(0, 160), content: text + SIG,
    image_url: files[0] ? `/img/news/${files[0]}` : '', category: category(text), published_at: date,
  })
  files.forEach((f, i) => auto.gallery.push({ id: `ga${p.pk}${i}`, type: 'image', url: `/img/news/${f}`, title }))
}

auto.news.sort((a, b) => b.published_at.localeCompare(a.published_at))
if (!DRY && fresh.length) {
  writeFileSync(AUTO, '// أخبار مُضافة تلقائياً بعد مراجعة المكتب (تُحدَّث عبر scripts/fetch-news.mjs وطلب دمج على GitHub).\n// يمكن تعديل العنوان أو النص هنا مباشرة قبل الدمج.\nexport default ' + JSON.stringify(auto, null, 2) + '\n')
  console.log('updated src/data/news-auto.js')
}
