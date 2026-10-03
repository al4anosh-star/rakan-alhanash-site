import { useState } from 'react'
import { site, provinces, requestTypes } from '../config/site'
import { Icon } from '../components/ui/icons'
import { PageHeader, Button } from '../components/ui'

const empty = { name: '', phone: '', province: '', type: '', details: '' }
const makeRef = () => {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', r = crypto.getRandomValues(new Uint8Array(5))
  return `AG-${new Date().getFullYear()}-${[...r].map((x) => a[x % a.length]).join('')}`
}
const Field = ({ label, children }) => <label className="block"><span className="block mb-1.5 font-bold text-navy-900 text-sm">{label}</span>{children}</label>

// استضافة ثابتة: لا يوجد خادم، فيُجهَّز نص الطلب ويرسله المواطن إلى المكتب عبر واتساب أو تلغرام
export default function StaticRequests() {
  const [f, setF] = useState(empty)
  const [out, setOut] = useState(null)
  const [err, setErr] = useState('')
  const [copied, setCopied] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const ch = site.requestChannels || {}

  function submit(e) {
    e.preventDefault(); setErr('')
    if (e.target.elements.website?.value) return
    if (!/^[0-9+\s-]{9,16}$/.test(f.phone)) return setErr('رقم الهاتف غير صحيح')
    const ref = makeRef()
    const text = `طلب جديد إلى مكتب النائب ${site.fullName}\n\nرقم المرجع: ${ref}\nالاسم: ${f.name}\nالهاتف: ${f.phone}\nالمحافظة: ${f.province}\nنوع الطلب: ${f.type}\n\nالتفاصيل:\n${f.details}`
    setOut({ ref, text })
  }
  const enc = encodeURIComponent
  const copy = async () => { try { await navigator.clipboard.writeText(out.text); setCopied(true) } catch {} }

  return (
    <>
      <PageHeader title="طلبات وشكاوى المواطنين" subtitle="يستقبل مكتب النائب طلبات المواطنين وشكاواهم ويتابعها لدى الجهات المختصة وفق الأصول" />
      <div className="container-x py-12 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {out ? (
            <div className="bg-white rounded-xl p-6 md:p-8 shadow border-t-4 border-gold-500 fade-in">
              <div className="mx-auto size-14 rounded-full bg-gold-500/15 text-gold-600 flex items-center justify-center"><Icon name="check" className="size-8" /></div>
              <h2 className="text-2xl font-extrabold text-navy-900 mt-3 text-center">الطلب جاهز للإرسال</h2>
              <p className="text-slate-600 mt-2 text-center">لم يُرسَل الطلب بعد. يرجى إرسال النص التالي إلى مكتب النائب عبر إحدى الوسائل أدناه، واحتفظوا برقم المرجع:</p>
              <div className="my-4 text-center"><span className="inline-block bg-navy-900 text-gold-300 text-xl font-extrabold tracking-wider px-6 py-3 rounded-lg" dir="ltr">{out.ref}</span></div>
              <pre className="bg-slate-50 border rounded-lg p-4 text-sm whitespace-pre-wrap font-sans leading-relaxed">{out.text}</pre>
              <div className="flex flex-wrap gap-3 justify-center mt-5">
                {ch.whatsapp && <Button as="a" href={`https://wa.me/${ch.whatsapp}?text=${enc(out.text)}`} target="_blank" rel="noreferrer" variant="navy">إرسال عبر واتساب</Button>}
                {ch.telegramUser && <Button as="a" href={`https://t.me/${ch.telegramUser}?text=${enc(out.text)}`} target="_blank" rel="noreferrer" variant="navy">إرسال عبر تلغرام</Button>}
                <Button variant="ghost" onClick={copy}>{copied ? 'تم النسخ' : 'نسخ نص الطلب'}</Button>
                <Button variant="ghost" onClick={() => { setOut(null); setF(empty); setCopied(false) }}>طلب جديد</Button>
              </div>
              {!ch.whatsapp && !ch.telegramUser && <p className="text-sm text-slate-500 text-center mt-4">يمكنكم نسخ النص وإرساله إلى المكتب مباشرة أو مراجعة المقر خلال أوقات الدوام.</p>}
            </div>
          ) : (
            <form onSubmit={submit} className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-black/5 grid gap-5">
              <h2 className="text-xl font-extrabold text-navy-900">تقديم طلب جديد</h2>
              <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
              <div className="grid md:grid-cols-2 gap-5">
                <Field label="الاسم الكامل"><input required className="input" value={f.name} onChange={set('name')} /></Field>
                <Field label="رقم الهاتف"><input required type="tel" dir="ltr" className="input text-right" placeholder="07XX XXX XXXX" value={f.phone} onChange={set('phone')} /></Field>
                <Field label="المحافظة"><select required className="input" value={f.province} onChange={set('province')}><option value="">اختر المحافظة</option>{provinces.map((p) => <option key={p}>{p}</option>)}</select></Field>
                <Field label="نوع الطلب"><select required className="input" value={f.type} onChange={set('type')}><option value="">اختر النوع</option>{requestTypes.map((p) => <option key={p}>{p}</option>)}</select></Field>
              </div>
              <Field label="التفاصيل"><textarea required rows={6} className="input" value={f.details} onChange={set('details')} /></Field>
              {err && <p className="text-red-600 font-bold">{err}</p>}
              <Button type="submit" variant="navy">تجهيز الطلب للإرسال</Button>
              <p className="text-xs text-slate-500">لا تُحفظ بياناتكم على الموقع، وتبقى على جهازكم حتى ترسلونها بأنفسكم إلى المكتب. يمكن إرفاق الصور عند إرسال الرسالة.</p>
            </form>
          )}
        </div>
        <aside>
          <div className="bg-white rounded-xl p-5 border border-black/5 text-sm leading-relaxed">
            <b className="text-navy-900">أوقات دوام المكتب</b>
            <p className="text-slate-600 mt-1">{site.officeHours}</p>
            <p className="text-slate-600 mt-1">{site.address}</p>
            <a href={site.social.telegram} target="_blank" rel="noreferrer" className="block mt-3 text-gold-600 font-bold">قناة المكتب الرسمية على تلغرام</a>
          </div>
        </aside>
      </div>
    </>
  )
}
