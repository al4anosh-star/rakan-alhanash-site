// إضافة خبر بسرعة من الطرفية:
// npm run add-news -- --title "العنوان" --text "النص" [--image path.jpg] [--date 2026-11-03] [--category "زيارات ميدانية"]
import { readFileSync, writeFileSync, copyFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const a = Object.fromEntries(process.argv.slice(2).reduce((r, x, i, all) => (x.startsWith('--') ? [...r, [x.slice(2), all[i + 1]]] : r), []))
if (!a.title || !a.text) { console.error('مطلوب --title و --text'); process.exit(1) }
const FILE = path.join(ROOT, 'src/data/news-auto.js')
const db = JSON.parse(readFileSync(FILE, 'utf8').replace(/^[\s\S]*?export default\s*/, ''))
const id = `m${Date.now()}`
let image_url = ''
if (a.image) { mkdirSync(path.join(ROOT, 'public/img/news'), { recursive: true }); const n = `${id}.jpg`; copyFileSync(a.image, path.join(ROOT, 'public/img/news', n)); image_url = `/img/news/${n}` }
const SIG = '\n\nالمكتب الإعلامي للنائب راكان الشيخ صباح غازي الحنش — عضو لجنة النزاهة.'
db.news.unshift({ id, title: a.title, summary: a.text.split(/[.\n]/)[0].slice(0, 160), content: a.text + SIG, image_url, category: a.category || 'نشاطات', published_at: a.date || new Date().toISOString().slice(0, 10) })
if (image_url) db.gallery.push({ id: `g${id}`, type: 'image', url: image_url, title: a.title })
db.news.sort((x, y) => y.published_at.localeCompare(x.published_at))
writeFileSync(FILE, '// أخبار مُضافة تلقائياً بعد مراجعة المكتب (تُحدَّث عبر scripts/fetch-news.mjs و scripts/add-news.mjs).\nexport default ' + JSON.stringify(db, null, 2) + '\n')
console.log('أُضيف الخبر:', a.title)
