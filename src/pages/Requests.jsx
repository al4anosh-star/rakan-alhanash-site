import { useState } from 'react'
import { site, provinces, requestTypes, requestStatuses } from '../config/site'
import { submitRequest, trackRequest } from '../lib/api'
import { fmtDate } from '../lib/utils'
import { Icon } from '../components/ui/icons'
import { PageHeader, Button } from '../components/ui'

const empty = { name: '', phone: '', province: '', type: '', details: '' }

function Field({ label, children }) {
  return <label className="block"><span className="block mb-1.5 font-bold text-navy-900 text-sm">{label}</span>{children}</label>
}

import StaticRequests from './StaticRequests'
import { isStatic } from '../lib/supabase'

export default function Requests() { return isStatic ? <StaticRequests /> : <ServerRequests /> }

function ServerRequests() {
  const [f, setF] = useState(empty)
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')
  const [q, setQ] = useState('')
  const [tracked, setTracked] = useState(undefined)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault(); setErr('')
    if (e.target.elements.website?.value) return // فخ للروبوتات
    if (!/^[0-9+\s-]{9,16}$/.test(f.phone)) return setErr('رقم الهاتف غير صحيح')
    if (file && file.size > 5 * 1024 * 1024) return setErr('حجم الصورة يجب ألا يتجاوز 5 ميغابايت')
    setBusy(true)
    try { setCode(await submitRequest(f, file)); setF(empty); setFile(null) }
    catch { setErr('تعذّر إرسال الطلب، حاول مرة أخرى') }
    setBusy(false)
  }

  async function track(e) {
    e.preventDefault()
    try { setTracked(await trackRequest(q)) } catch { setTracked(null) }
  }

  return (
    <>
      <PageHeader title="طلبات وشكاوى المواطنين" subtitle="يستقبل مكتب النائب طلبات المواطنين وشكاواهم ويتابعها لدى الجهات المختصة وفق الأصول" />
      <div className="container-x py-12 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {code ? (
            <div className="bg-white rounded-xl p-8 text-center shadow border-t-4 border-green-600 fade-in">
              <div className="mx-auto size-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center"><Icon name="check" className="size-9" /></div>
              <h2 className="text-2xl font-extrabold text-navy-900 mt-3">تم استلام طلبكم بنجاح</h2>
              <p className="text-slate-600 mt-2">يرجى الاحتفاظ برقم المتابعة التالي للاستعلام عن حالة طلبكم:</p>
              <div className="my-5 inline-block bg-navy-900 text-gold-300 text-2xl md:text-3xl font-extrabold tracking-wider px-8 py-4 rounded-lg" dir="ltr">{code}</div>
              <div className="flex gap-3 justify-center">
                <Button variant="ghost" onClick={() => navigator.clipboard?.writeText(code)}>نسخ الرقم</Button>
                <Button variant="navy" onClick={() => setCode('')}>طلب جديد</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-black/5 grid gap-5">
              <h2 className="text-xl font-extrabold text-navy-900">تقديم طلب جديد</h2>
              <div className="grid md:grid-cols-2 gap-5">
                <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
              <Field label="الاسم الكامل"><input required className="input" value={f.name} onChange={set('name')} /></Field>
                <Field label="رقم الهاتف"><input required type="tel" dir="ltr" className="input text-right" placeholder="07XX XXX XXXX" value={f.phone} onChange={set('phone')} /></Field>
                <Field label="المحافظة">
                  <select required className="input" value={f.province} onChange={set('province')}>
                    <option value="">اختر المحافظة</option>{provinces.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="نوع الطلب">
                  <select required className="input" value={f.type} onChange={set('type')}>
                    <option value="">اختر النوع</option>{requestTypes.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="التفاصيل"><textarea required rows={6} className="input" value={f.details} onChange={set('details')} /></Field>
              <Field label="إرفاق صورة (اختياري)"><input type="file" accept="image/*" className="input" onChange={(e) => setFile(e.target.files[0] || null)} /></Field>
              {err && <p className="text-red-600 font-bold">{err}</p>}
              <Button type="submit" variant="navy" disabled={busy}>{busy ? 'جارٍ الإرسال...' : 'إرسال الطلب'}</Button>
            </form>
          )}
        </div>

        <aside>
          <form onSubmit={track} className="bg-navy-900 text-white rounded-xl p-6 sticky top-24">
            <h3 className="font-extrabold text-lg">الاستعلام عن طلب</h3>
            <p className="text-white/70 text-sm mt-1 mb-4">يرجى إدخال رقم المتابعة</p>
            <input required dir="ltr" placeholder="AG-2026-10001-XXXX" className="input text-center !text-navy-900" value={q} onChange={(e) => setQ(e.target.value)} />
            <Button type="submit" className="w-full mt-3">بحث</Button>
            {tracked === null && <p className="mt-4 text-red-300 text-sm">لم يتم العثور على طلب بهذا الرقم</p>}
            {tracked && (
              <div className="mt-4 bg-white/10 rounded-lg p-4 text-sm space-y-1 fade-in">
                <p>النوع: <b>{tracked.type}</b></p>
                <p>التاريخ: <b>{fmtDate(tracked.created_at)}</b></p>
                <p>الحالة: <span className={`px-2 py-0.5 rounded-full font-bold ${requestStatuses[tracked.status]?.color}`}>{requestStatuses[tracked.status]?.label}</span></p>
              </div>
            )}
          </form>
          <div className="mt-4 bg-white rounded-xl p-5 border border-black/5 text-sm leading-relaxed">
            <b className="text-navy-900">أوقات دوام المكتب</b>
            <p className="text-slate-600 mt-1">{site.officeHours}</p>
            <a href={site.social.telegram} target="_blank" rel="noreferrer" className="block mt-3 text-gold-600 font-bold">قناة المكتب الرسمية على تلغرام</a>
          </div>
        </aside>
      </div>
    </>
  )
}
