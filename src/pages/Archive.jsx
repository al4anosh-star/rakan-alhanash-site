import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getNews } from '../lib/api'
import { fmtDate, fmtNum } from '../lib/utils'
import { PageHeader, Loader, Empty, useAsync } from '../components/ui'

const mLabel = (k) => new Date(`${k}-01T00:00:00`).toLocaleDateString('ar-IQ', { month: 'long', year: 'numeric' })

export default function Archive() {
  const { data, loading } = useAsync(() => getNews())
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [month, setMonth] = useState('')
  const all = data || []
  const months = useMemo(() => [...new Set(all.map((n) => (n.published_at || '').slice(0, 7)).filter(Boolean))].sort().reverse(), [all])
  const cats = useMemo(() => [...new Set(all.map((n) => n.category).filter(Boolean))], [all])
  const rows = all.filter((n) => (!cat || n.category === cat) && (!month || (n.published_at || '').startsWith(month)) &&
    (!q || [n.title, n.summary, n.content].some((v) => v && v.includes(q.trim()))))
  const byMonth = rows.reduce((a, n) => ((a[(n.published_at || '').slice(0, 7)] ||= []).push(n), a), {})

  return (
    <>
      <PageHeader title="أرشيف الأخبار" subtitle="ابحث في كل الأخبار حسب الشهر والتصنيف" />
      <div className="container-x py-10 max-w-4xl">
        {loading ? <Loader /> : (
          <>
            <div className="bg-white rounded-xl border border-black/5 shadow-sm p-4 md:p-5 grid md:grid-cols-3 gap-3 mb-8">
              <input className="input md:col-span-3" placeholder="بحث في عناوين الأخبار ونصوصها" value={q} onChange={(e) => setQ(e.target.value)} aria-label="بحث" />
              <select className="input" value={month} onChange={(e) => setMonth(e.target.value)} aria-label="الشهر"><option value="">كل الأشهر</option>{months.map((m) => <option key={m} value={m}>{mLabel(m)}</option>)}</select>
              <select className="input" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="التصنيف"><option value="">كل التصنيفات</option>{cats.map((c) => <option key={c}>{c}</option>)}</select>
              <div className="flex items-center text-slate-600 text-sm">النتائج: <b className="mx-1 text-navy-900">{fmtNum(rows.length)}</b> من {fmtNum(all.length)}</div>
            </div>
            {!rows.length ? <Empty text="لا توجد أخبار مطابقة" /> : Object.entries(byMonth).sort((a, b) => b[0].localeCompare(a[0])).map(([m, list]) => (
              <section key={m} className="mb-8">
                <h2 className="font-extrabold text-navy-900 border-s-4 border-gold-500 ps-3 mb-3">{mLabel(m)} <span className="text-sm text-slate-500 font-normal">({fmtNum(list.length)})</span></h2>
                <div className="bg-white rounded-xl border border-black/5 shadow-sm divide-y divide-black/10">
                  {list.map((n) => (
                    <Link key={n.id} to={`/news/${n.id}`} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 p-4 hover:bg-slate-50">
                      <span className="text-sm text-slate-500 w-28 shrink-0">{fmtDate(n.published_at)}</span>
                      <span className="font-bold text-navy-900 flex-1 min-w-48">{n.title}</span>
                      {n.category && <span className="text-xs bg-gold-500/15 text-gold-600 font-bold px-2.5 py-1 rounded-full">{n.category}</span>}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </>
        )}
      </div>
    </>
  )
}
