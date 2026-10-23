import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getList } from '../lib/api'
import { site } from '../config/site'
import { fmtDate, fmtNum } from '../lib/utils'
import { PageHeader, Loader, Empty, Button, useAsync } from '../components/ui'

export default function Completed() {
  const { data, loading } = useAsync(() => getList('completed_items'))
  const [q, setQ] = useState('')
  const [ministry, setMinistry] = useState('')

  const all = data || []
  const ministries = useMemo(() => [...new Set(all.map((x) => x.ministry))], [all])
  const batches = useMemo(() => new Set(all.map((x) => x.done_date)).size, [all])
  const latest = useMemo(() => all.reduce((m, x) => (x.done_date > m ? x.done_date : m), ''), [all])
  const rows = all.filter((x) =>
    (!ministry || x.ministry === ministry) &&
    (!q || [x.title, x.citizen_name, x.ref_no, x.ministry].some((v) => v && v.includes(q.trim()))))
  const groups = Object.entries(rows.reduce((a, r) => ((a[r.done_date] ||= []).push(r), a), {})).sort((a, b) => b[0].localeCompare(a[0]))

  return (
    <>
      <PageHeader title="المعاملات المنجزة" subtitle="سجل الموافقات والمعاملات التي أُنجزت للمواطنين لدى الوزارات والدوائر الحكومية" />
      <div className="container-x py-10 max-w-5xl">
        {loading ? <Loader /> : !all.length ? <Empty text="لم تُنشر وجبات بعد" /> : (
          <>
            <div className="grid grid-cols-3 gap-3 md:gap-5 mb-8">
              {[[fmtNum(batches), 'وجبة معلنة'], [fmtNum(all.length), 'بنداً منجزاً'], [fmtDate(latest), 'آخر تحديث']].map(([v, l]) => (
                <div key={l} className="bg-navy-900 text-white rounded-xl p-4 md:p-6 text-center">
                  <div className="text-xl md:text-3xl font-extrabold text-gold-500 font-display leading-tight">{v}</div>
                  <div className="text-white/75 text-xs md:text-base mt-1">{l}</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-black/5 shadow-sm p-4 md:p-5 mb-8 space-y-4">
              <input className="input" placeholder="بحث بنوع المعاملة أو الجهة أو الاسم أو رقم المعاملة" value={q} onChange={(e) => setQ(e.target.value)} aria-label="بحث" />
              <div className="flex flex-wrap gap-2">
                {['', ...ministries].map((m) => (
                  <button key={m || 'all'} onClick={() => setMinistry(m)} className={`px-3.5 py-1.5 rounded-full text-sm font-bold transition ${ministry === m ? 'bg-navy-900 text-white' : 'bg-slate-100 text-navy-900 hover:bg-gold-500/20'}`}>{m || 'جميع الجهات'}</button>
                ))}
              </div>
            </div>

            {!groups.length ? <Empty text="لا توجد نتائج مطابقة" /> : (
              <div className="space-y-8">
                {groups.map(([date, list]) => (
                  <section key={date}>
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="font-extrabold text-navy-900 border-s-4 border-gold-500 ps-3">وجبة {fmtDate(date)}</h2>
                      {date === latest && <span className="bg-gold-500 text-navy-950 text-xs font-bold px-2.5 py-1 rounded-full">الأحدث</span>}
                      <span className="text-sm text-slate-500">({fmtNum(list.length)} بنداً)</span>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-black/5 divide-y divide-black/10">
                      {list.map((x) => (
                        <div key={x.id} className="p-4 flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="font-bold text-navy-900">{x.title}</div>
                            <div className="text-sm text-slate-500">{x.ministry}</div>
                          </div>
                          <div className="text-sm text-slate-600 text-end">
                            {x.citizen_name && <div>{x.citizen_name}</div>}
                            {x.ref_no && <div dir="ltr">{x.ref_no}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}

            <div className="mt-12 grid md:grid-cols-2 gap-5">
              <div className="bg-gold-500/10 rounded-xl p-6 leading-relaxed">
                <h3 className="font-extrabold text-navy-900 mb-2">كيف أستلم معاملتي؟</h3>
                <p className="text-slate-700 text-sm">يراجع صاحب المعاملة المنجزة مقر المكتب خلال أوقات الدوام الرسمي: <b>{site.officeHours}</b>.</p>
                <p className="text-slate-700 text-sm mt-2">العنوان: {site.address}</p>
                {site.social.telegram && <p className="text-sm mt-2">تُنشر الأسماء والوثائق التفصيلية على <a href={site.social.telegram} target="_blank" rel="noreferrer" className="text-gold-600 font-bold">القناة الرسمية في تلغرام</a>.</p>}
              </div>
              <div className="bg-white rounded-xl border border-black/5 shadow-sm p-6 leading-relaxed">
                <h3 className="font-extrabold text-navy-900 mb-2">لم تجد معاملتك؟</h3>
                <p className="text-slate-700 text-sm">قدّم طلبك أو استعلم عن حالة طلب سابق برقم المرجع.</p>
                <Button as={Link} to="/requests" variant="navy" className="mt-4 !py-2.5 text-sm">طلبات المواطنين</Button>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-6">لا تُنشر أسماء المواطنين أو وثائقهم إلا بموافقتهم.</p>
          </>
        )}
      </div>
    </>
  )
}
