import { useEffect, useState } from 'react'
import Crud from './Crud'
import { adminList, adminSave, signedUrl, getSettings, saveSettings } from '../lib/api'
import { newsCategories, requestStatuses } from '../config/site'
import { fmtDate } from '../lib/utils'
import { Button, Loader } from '../components/ui'

const thumb = (r) => (r.image_url || r.url ? <img src={r.image_url || r.url} className="h-10 rounded" alt="" /> : '—')

export const NewsManager = () => (
  <Crud table="news" title="الأخبار" order="published_at"
    defaults={{ published: true, published_at: new Date().toISOString().slice(0, 10), category: newsCategories[0] }}
    fields={[
      { key: 'title', label: 'العنوان', required: true },
      { key: 'category', label: 'التصنيف', type: 'select', options: newsCategories },
      { key: 'published_at', label: 'التاريخ', type: 'date' },
      { key: 'image_url', label: 'الصورة', type: 'image' },
      { key: 'summary', label: 'ملخص قصير', type: 'textarea' },
      { key: 'content', label: 'نص الخبر', type: 'textarea' },
    ]}
    columns={[{ key: 'image_url', label: 'صورة', render: thumb }, { key: 'title', label: 'العنوان' }, { key: 'category', label: 'التصنيف' }, { key: 'published', label: 'منشور', render: (r) => (r.published ? 'نعم' : 'لا') }]} />
)

export const CompletedManager = () => (
  <Crud table="completed_items" title="المعاملات المنجزة" order="done_date" defaults={{ done_date: new Date().toISOString().slice(0, 10) }}
    fields={[
      { key: 'done_date', label: 'تاريخ الوجبة', type: 'date', required: true },
      { key: 'ministry', label: 'الوزارة / الجهة', required: true },
      { key: 'title', label: 'نوع المعاملة', required: true },
      { key: 'citizen_name', label: 'اسم المواطن (اختياري - يُنشر بموافقته فقط)' },
      { key: 'ref_no', label: 'رقم المعاملة (اختياري)' },
    ]}
    columns={[{ key: 'done_date', label: 'التاريخ' }, { key: 'ministry', label: 'الجهة' }, { key: 'title', label: 'المعاملة' }, { key: 'citizen_name', label: 'المواطن' }]} />
)

export function ReportsManager() {
  const [rows, setRows] = useState(null)
  useEffect(() => { adminList('citizen_requests').then(setRows) }, [])
  if (!rows) return <Loader />
  const by = (fn) => Object.entries(rows.reduce((a, r) => { const k = fn(r); a[k] = (a[k] || 0) + 1; return a }, {})).sort((a, b) => b[1] - a[1])
  const done = rows.filter((r) => r.status === 'done')
  const days = done.length ? Math.round(done.reduce((s, r) => s + (Date.now() - new Date(r.created_at)) / 864e5, 0) / done.length) : 0
  const Box = ({ t, v }) => <div className="bg-white rounded-xl p-5 shadow-sm"><div className="text-sm text-slate-500">{t}</div><div className="text-3xl font-extrabold text-navy-900 mt-1">{v}</div></div>
  const List = ({ t, data }) => (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h3 className="font-extrabold text-navy-900 mb-3">{t}</h3>
      {data.length ? data.map(([k, n]) => (
        <div key={k} className="mb-2"><div className="flex justify-between text-sm"><span>{k}</span><b>{n}</b></div>
          <div className="h-2 bg-slate-100 rounded"><div className="h-2 rounded bg-navy-800" style={{ width: `${(n / rows.length) * 100}%` }} /></div></div>
      )) : <p className="text-slate-500 text-sm">لا توجد بيانات</p>}
    </div>
  )
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h2 className="text-xl font-extrabold text-navy-900">التقارير والإحصاءات</h2>
        <Button variant="ghost" onClick={() => window.print()}>طباعة التقرير</Button></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Box t="إجمالي الطلبات" v={rows.length} /><Box t="جديد" v={rows.filter((r) => r.status === 'new').length} />
        <Box t="قيد المتابعة" v={rows.filter((r) => r.status === 'in_progress').length} /><Box t="منجز" v={done.length} />
      </div>
      <p className="text-sm text-slate-600">نسبة الإنجاز: <b>{rows.length ? Math.round((done.length / rows.length) * 100) : 0}%</b> — متوسط عمر الطلبات المنجزة منذ تقديمها: <b>{days} يوم</b></p>
      <div className="grid md:grid-cols-3 gap-4">
        <List t="حسب المحافظة" data={by((r) => r.province)} /><List t="حسب نوع الطلب" data={by((r) => r.type)} />
        <List t="حسب الشهر" data={by((r) => new Date(r.created_at).toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long' }))} />
      </div>
    </div>
  )
}

export const GalleryManager = () => (
  <Crud table="gallery" title="المعرض" defaults={{ type: 'image' }}
    fields={[
      { key: 'type', label: 'النوع', type: 'select', options: [{ value: 'image', label: 'صورة' }, { value: 'video', label: 'فيديو' }] },
      { key: 'title', label: 'العنوان' },
      { key: 'url', label: 'رابط (صورة / يوتيوب / فيديو) — أو ارفع صورة بالأسفل', required: true },
      { key: 'url', label: 'رفع صورة', type: 'image' },
    ]}
    columns={[{ key: 'url', label: 'معاينة', render: (r) => (r.type === 'image' ? thumb(r) : 'فيديو') }, { key: 'title', label: 'العنوان' }, { key: 'type', label: 'النوع' }]} />
)

export const AchievementsManager = () => (
  <Crud table="achievements" title="الإنجازات والمشاريع"
    fields={[
      { key: 'title', label: 'العنوان', required: true }, { key: 'category', label: 'التصنيف' },
      { key: 'year', label: 'السنة', type: 'number' }, { key: 'image_url', label: 'الصورة', type: 'image' },
      { key: 'description', label: 'الوصف', type: 'textarea' },
    ]}
    columns={[{ key: 'image_url', label: 'صورة', render: thumb }, { key: 'title', label: 'العنوان' }, { key: 'year', label: 'السنة' }]} />
)

export const TimelineManager = () => (
  <Crud table="bio_timeline" title="السيرة الذاتية (الخط الزمني)" order="sort_order" defaults={{ kind: 'position', sort_order: 0 }}
    fields={[
      { key: 'kind', label: 'النوع', type: 'select', options: [{ value: 'birth', label: 'نشأة' }, { value: 'education', label: 'شهادة' }, { value: 'position', label: 'منصب' }] },
      { key: 'year', label: 'السنة', required: true }, { key: 'title', label: 'العنوان', required: true },
      { key: 'description', label: 'الوصف', type: 'textarea' }, { key: 'sort_order', label: 'الترتيب (الأصغر أولاً)', type: 'number' },
    ]}
    columns={[{ key: 'year', label: 'السنة' }, { key: 'title', label: 'العنوان' }, { key: 'kind', label: 'النوع' }]} />
)

export function RequestsManager() {
  const [rows, setRows] = useState(null)
  const [filter, setFilter] = useState('')
  const [open, setOpen] = useState(null)
  const [img, setImg] = useState(null)
  const load = () => adminList('citizen_requests').then(setRows)
  useEffect(() => { load() }, [])
  useEffect(() => { setImg(null); open?.image_url && signedUrl(open.image_url).then(setImg) }, [open])

  async function setStatus(r, status) {
    await adminSave('citizen_requests', { id: r.id, status })
    setOpen({ ...r, status }); load()
  }
  if (!rows) return <Loader />
  const list = rows.filter((r) => !filter || r.status === filter)
  const count = (s) => rows.filter((r) => r.status === s).length
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setFilter('')} className={`px-4 py-2 rounded-full text-sm font-bold ${!filter ? 'bg-navy-900 text-white' : 'bg-white'}`}>الكل ({rows.length})</button>
        {Object.entries(requestStatuses).map(([k, v]) => (
          <button key={k} onClick={() => setFilter(k)} className={`px-4 py-2 rounded-full text-sm font-bold ${filter === k ? 'bg-navy-900 text-white' : 'bg-white'}`}>{v.label} ({count(k)})</button>
        ))}
      </div>
      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50"><tr><th className="p-3 text-start">الرقم</th><th className="p-3 text-start">الاسم</th><th className="p-3 text-start">النوع</th><th className="p-3 text-start">الحالة</th></tr></thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id} onClick={() => setOpen(r)} className={`border-t cursor-pointer hover:bg-slate-50 ${open?.id === r.id ? 'bg-gold-500/10' : ''}`}>
                  <td className="p-3" dir="ltr">{r.tracking_code}</td><td className="p-3">{r.name}</td><td className="p-3">{r.type}</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${requestStatuses[r.status]?.color}`}>{requestStatuses[r.status]?.label}</span></td>
                </tr>
              ))}
              {!list.length && <tr><td colSpan={4} className="p-8 text-center text-slate-500">لا توجد طلبات</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="lg:col-span-2">
          {open ? (
            <div className="bg-white rounded-xl p-5 shadow-sm sticky top-4 space-y-2 text-sm">
              <h3 className="font-extrabold text-lg text-navy-900" dir="ltr">{open.tracking_code}</h3>
              <p><b>الاسم:</b> {open.name}</p>
              <p><b>الهاتف:</b> <a href={`tel:${open.phone}`} dir="ltr" className="text-blue-700">{open.phone}</a></p>
              <p><b>المحافظة:</b> {open.province}</p><p><b>النوع:</b> {open.type}</p><p><b>التاريخ:</b> {fmtDate(open.created_at)}</p>
              <p className="whitespace-pre-line bg-slate-50 rounded p-3 leading-relaxed">{open.details}</p>
              {img && <a href={img} target="_blank" rel="noreferrer"><img src={img} alt="" className="rounded max-h-60" /></a>}
              <div className="flex flex-wrap gap-2 pt-2">
                {Object.entries(requestStatuses).map(([k, v]) => (
                  <Button key={k} variant={open.status === k ? 'navy' : 'ghost'} className="!px-3 !py-2 text-sm" onClick={() => setStatus(open, k)}>{v.label}</Button>
                ))}
              </div>
            </div>
          ) : <p className="text-slate-500 text-center py-10">اختر طلباً لعرض تفاصيله</p>}
        </div>
      </div>
    </div>
  )
}

export function SettingsManager() {
  const [s, setS] = useState(null)
  const [msg, setMsg] = useState('')
  useEffect(() => { getSettings().then((d) => setS({ stats: [], ...d })) }, [])
  if (!s) return <Loader />
  const stats = s.stats || []
  const setStat = (i, k, v) => setS({ ...s, stats: stats.map((x, j) => (j === i ? { ...x, [k]: v } : x)) })
  async function save(e) {
    e.preventDefault()
    try { await saveSettings(s); setMsg('تم الحفظ') } catch (err) { setMsg(err.message) }
  }
  return (
    <form onSubmit={save} className="bg-white rounded-xl p-5 grid gap-5 max-w-3xl">
      <h2 className="text-xl font-extrabold text-navy-900">إعدادات الموقع</h2>
      <label><span className="block mb-1 font-bold text-sm">الكلمة الترحيبية</span><textarea rows={4} className="input" value={s.welcome || ''} onChange={(e) => setS({ ...s, welcome: e.target.value })} /></label>
      <label><span className="block mb-1 font-bold text-sm">نص النشأة (صفحة السيرة)</span><textarea rows={6} className="input" value={s.bio_text || ''} onChange={(e) => setS({ ...s, bio_text: e.target.value })} /></label>
      <div>
        <span className="block mb-2 font-bold text-sm">أرقام الإنجازات</span>
        {stats.map((x, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input className="input" placeholder="الوصف" value={x.label} onChange={(e) => setStat(i, 'label', e.target.value)} />
            <input className="input !w-32" type="number" value={x.value} onChange={(e) => setStat(i, 'value', Number(e.target.value))} />
            <button type="button" className="text-red-600 px-2" onClick={() => setS({ ...s, stats: stats.filter((_, j) => j !== i) })}>حذف</button>
          </div>
        ))}
        <Button type="button" variant="ghost" onClick={() => setS({ ...s, stats: [...stats, { label: '', value: 0 }] })}>+ إضافة رقم</Button>
      </div>
      <div className="flex items-center gap-3"><Button type="submit">حفظ</Button><span className="font-bold">{msg}</span></div>
    </form>
  )
}
