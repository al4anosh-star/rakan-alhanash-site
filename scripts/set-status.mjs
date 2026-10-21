// تحديث حالة طلب بعد متابعته:  npm run status -- AG-2026-XXXXX in_progress "ملاحظة اختيارية"
// الحالات: new | in_progress | done   — الملف public/status.json يحوي أرقام المرجع فقط (بدون أسماء ولا هواتف).
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const file = fileURLToPath(new URL('../public/status.json', import.meta.url))
const [code, status, ...note] = process.argv.slice(2)
if (!/^AG-\d{4}-[A-Z0-9]{4,}$/i.test(code || '') || !['new', 'in_progress', 'done'].includes(status)) {
  console.error('الاستخدام: npm run status -- AG-2026-XXXXX new|in_progress|done ["ملاحظة"]'); process.exit(1)
}
const all = JSON.parse(readFileSync(file, 'utf8') || '{}')
all[code.toUpperCase()] = { status, updated: new Date().toISOString().slice(0, 10), ...(note.length ? { note: note.join(' ') } : {}) }
writeFileSync(file, JSON.stringify(all, null, 2) + '\n')
console.log('تم:', code.toUpperCase(), '→', status)
