// يولّد أكواداً شخصية للمعاملات المنجزة، وينشر بصماتها المشفّرة فقط (بدون أسماء).
// الاستخدام: ضع الملف المحلي  private/codes-input.csv  بالأعمدة:  الاسم,الجهة,المعاملة,التاريخ   (ملف private/ خارج Git)
//            ثم:  npm run codes     ← ينتج  private/codes-output.csv (للمكتب: الاسم + الكود)  و  public/codes.json (للموقع)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { pbkdf2Sync, randomBytes } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const IN = path.join(ROOT, 'private/codes-input.csv')
const OUT = path.join(ROOT, 'private/codes-output.csv')
const PUB = path.join(ROOT, 'public/codes.json')
const ITER = 150000
if (!existsSync(IN)) { console.error('لا يوجد private/codes-input.csv'); process.exit(1) }

const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const rnd = (n) => [...randomBytes(n)].map((b) => A[b % A.length]).join('')
const derive = (code, salt) => pbkdf2Sync(code, salt, ITER, 16, 'sha256').toString('base64').replace(/[+/=]/g, '')
const parse = (l) => l.split(',').map((x) => x.trim().replace(/^"|"$/g, ''))

const prev = existsSync(PUB) ? JSON.parse(readFileSync(PUB, 'utf8')) : null
const salt = prev?.salt || randomBytes(12).toString('hex')
const items = prev?.items || {}
const rows = readFileSync(IN, 'utf8').split(/\r?\n/).filter(Boolean).slice(1).map(parse)
const out = ['الاسم,الجهة,المعاملة,التاريخ,الكود']
for (const [name, ministry, title, date] of rows) {
  const code = `MN${rnd(5)}${rnd(5)}`
  items[derive(code, salt)] = { ministry, title, date }
  out.push(`"${name}","${ministry}","${title}","${date}",MN-${code.slice(2, 7)}-${code.slice(7)}`)
}
mkdirSync(path.dirname(OUT), { recursive: true })
writeFileSync(OUT, '﻿' + out.join('\n') + '\n')
writeFileSync(PUB, JSON.stringify({ v: 1, salt, iter: ITER, items }))
console.log(`تم: ${rows.length} كود. أعطِ private/codes-output.csv للمكتب ولا ترفعه. ثم ارفع public/codes.json.`)
