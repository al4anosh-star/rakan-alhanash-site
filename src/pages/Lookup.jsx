import { useState } from 'react'
import { Link } from 'react-router-dom'
import { site } from '../config/site'
import { fmtDate } from '../lib/utils'
import { PageHeader, Button } from '../components/ui'

const enc = new TextEncoder()
const b64 = (u8) => btoa(String.fromCharCode(...u8))
// نفس الاشتقاق المستخدم في scripts/make-codes.mjs (PBKDF2 بتكرار عالٍ ليصعب التخمين)
async function derive(code, salt, iter) {
  const key = await crypto.subtle.importKey('raw', enc.encode(code), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations: iter }, key, 128)
  return b64(new Uint8Array(bits)).replace(/[+/=]/g, '')
}

export default function Lookup() {
  const [code, setCode] = useState('')
  const [res, setRes] = useState(undefined)
  const [busy, setBusy] = useState(false)
  async function go(e) {
    e.preventDefault(); setBusy(true); setRes(undefined)
    try {
      const norm = code.toUpperCase().replace(/[^A-Z0-9]/g, '')
      const r = await fetch(`${import.meta.env.BASE_URL}codes.json`)
      const db = await r.json()
      const h = await derive(norm, db.salt, db.iter)
      setRes(db.items[h] || null)
    } catch { setRes(null) }
    setBusy(false)
  }
  return (
    <>
      <PageHeader title="الاستعلام عن معاملة منجزة" subtitle="أدخل الكود الذي استلمته من المكتب" />
      <div className="container-x py-12 max-w-xl">
        <form onSubmit={go} className="bg-white rounded-xl border border-black/5 shadow-sm p-6 space-y-4">
          <label className="block"><span className="block mb-1.5 font-bold text-navy-900 text-sm">كود المعاملة</span>
            <input required dir="ltr" className="input text-center text-lg tracking-widest" placeholder="MN-XXXXX-XXXXX" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" /></label>
          <Button type="submit" variant="navy" className="w-full" disabled={busy}>{busy ? 'جارٍ البحث...' : 'استعلام'}</Button>
          {res === null && <p className="text-amber-700 text-sm leading-relaxed">لم يُعثر على معاملة بهذا الكود. تأكد من كتابته كما استلمته، أو راجع المكتب خلال الدوام.</p>}
          {res && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-1 fade-in">
              <p className="font-extrabold text-green-800">معاملتك منجزة</p>
              <p className="text-sm text-slate-700">الجهة: <b>{res.ministry}</b></p>
              <p className="text-sm text-slate-700">المعاملة: <b>{res.title}</b></p>
              {res.date && <p className="text-sm text-slate-700">تاريخ الإنجاز: <b>{fmtDate(res.date)}</b></p>}
              <p className="text-sm text-slate-700 mt-2">يرجى مراجعة مقر المكتب لاستلامها خلال الدوام: {site.officeHours}.</p>
            </div>
          )}
        </form>
        <p className="text-xs text-slate-500 mt-4 leading-relaxed">لا تُنشر أسماء المواطنين على الموقع. الكود شخصي، لا تشاركه مع غيرك. <Link to="/faq" className="text-gold-600 font-bold">الأسئلة الشائعة</Link></p>
      </div>
    </>
  )
}
