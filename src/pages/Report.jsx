import { useMemo, useState } from 'react'
import { site } from '../config/site'
import { getNews, getList } from '../lib/api'
import { asset, fmtDate, fmtNum } from '../lib/utils'
import { Button, Loader, Empty, useAsync } from '../components/ui'

const monthKey = (d) => (d || '').slice(0, 7)
const monthLabel = (k) => new Date(`${k}-01T00:00:00`).toLocaleDateString('ar-IQ', { month: 'long', year: 'numeric' })

export default function Report() {
  const news = useAsync(() => getNews())
  const done = useAsync(() => getList('completed_items'))
  const months = useMemo(() => [...new Set((news.data || []).map((n) => monthKey(n.published_at)).filter(Boolean))].sort().reverse(), [news.data])
  const [sel, setSel] = useState('')
  const month = sel || months[0]
  const items = (news.data || []).filter((n) => monthKey(n.published_at) === month)
  const batches = new Set((done.data || []).filter((x) => monthKey(x.done_date) === month).map((x) => x.done_date)).size
  const count = (cats) => items.filter((n) => cats.includes(n.category)).length
  const groups = items.reduce((a, n) => ((a[n.category] ||= []).push(n), a), {})

  if (news.loading) return <Loader />
  if (!months.length) return <Empty text="لا توجد بيانات كافية لإعداد تقرير" />

  return (
    <div className="container-x py-10 max-w-4xl print-page">
      <div className="no-print flex flex-wrap items-center justify-between gap-3 mb-8">
        <h1 className="text-2xl font-extrabold text-navy-900">تقرير الحصاد الشهري</h1>
        <div className="flex gap-3 items-center">
          <select className="input !w-auto" value={month} onChange={(e) => setSel(e.target.value)} aria-label="الشهر">
            {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
          </select>
          <Button variant="navy" onClick={() => window.print()}>طباعة / حفظ PDF</Button>
        </div>
      </div>

      <article className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden">
        <header className="bg-navy-900 text-white p-6 md:p-8 flex items-center gap-5 border-b-4 border-gold-500">
          <img src={asset(site.logo)} alt="" className="size-16" />
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold">{site.fullName}</h2>
            <p className="text-gold-300">{site.title}</p>
            <p className="text-white/80 mt-1">تقرير الحصاد الشهري — {monthLabel(month)}</p>
          </div>
        </header>
        <div className="p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[[count(['زيارات ميدانية']), 'زيارة ميدانية'], [count(['لقاءات']), 'لقاء'], [count(['بيانات']), 'بيان'], [batches, 'وجبة معاملات منجزة']].map(([v, l]) => (
              <div key={l} className="border border-black/10 rounded-lg p-4 text-center">
                <div className="text-3xl font-extrabold text-navy-900 font-display">{fmtNum(v)}</div><div className="text-sm text-slate-600 mt-1">{l}</div>
              </div>
            ))}
          </div>
          {Object.entries(groups).map(([cat, list]) => (
            <section key={cat}>
              <h3 className="font-extrabold text-navy-900 border-s-4 border-gold-500 ps-3 mb-3">{cat} ({fmtNum(list.length)})</h3>
              <ul className="space-y-2">
                {list.map((n) => (
                  <li key={n.id} className="flex gap-3 text-slate-800 leading-relaxed">
                    <span className="text-sm text-slate-500 shrink-0 w-28">{fmtDate(n.published_at)}</span><span>{n.title}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <p className="text-xs text-slate-500 border-t pt-4">أُعدّ هذا التقرير تلقائياً من الأخبار المنشورة على الموقع الرسمي.</p>
        </div>
      </article>
    </div>
  )
}
