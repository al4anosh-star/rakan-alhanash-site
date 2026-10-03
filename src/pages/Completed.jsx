import { useMemo, useState } from 'react'
import { getList } from '../lib/api'
import { site } from '../config/site'
import { fmtDate } from '../lib/utils'
import { PageHeader, Loader, Empty, useAsync } from '../components/ui'

export default function Completed() {
  const { data, loading } = useAsync(() => getList('completed_items'))
  const [q, setQ] = useState('')
  const [ministry, setMinistry] = useState('')
  const ministries = useMemo(() => [...new Set((data || []).map((x) => x.ministry))], [data])
  const rows = (data || []).filter((x) =>
    (!ministry || x.ministry === ministry) &&
    (!q || [x.title, x.citizen_name, x.ref_no, x.ministry].some((v) => v && v.includes(q.trim()))))
  const groups = rows.reduce((a, r) => ((a[r.done_date] ||= []).push(r), a), {})

  return (
    <>
      <PageHeader title="المعاملات المنجزة" subtitle="الموافقات والمعاملات التي أُنجزت لأبناء محافظة نينوى لدى الوزارات والدوائر" />
      <div className="container-x py-10 max-w-4xl">
        <div className="grid sm:grid-cols-2 gap-3 mb-8">
          <input className="input" placeholder="بحث بالاسم أو رقم المعاملة أو نوعها" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="input" value={ministry} onChange={(e) => setMinistry(e.target.value)}>
            <option value="">جميع الجهات</option>{ministries.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        {loading ? <Loader /> : !rows.length ? <Empty text="لا توجد نتائج مطابقة" /> : (
          <div className="space-y-8">
            {Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0])).map(([date, list]) => (
              <section key={date}>
                <h2 className="font-extrabold text-navy-900 mb-3 border-s-4 border-gold-500 ps-3">وجبة {fmtDate(date)}</h2>
                <div className="bg-white rounded-xl shadow-sm border border-black/5 divide-y">
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
        <p className="mt-10 text-sm text-slate-600 bg-gold-500/10 rounded-lg p-4 leading-relaxed">
          يرجى من أصحاب المعاملات المنجزة مراجعة مقر المكتب لاستلام معاملاتهم خلال أوقات الدوام الرسمي: {site.officeHours}.
          تُنشر الأسماء والوثائق التفصيلية على <a href={site.social.telegram} target="_blank" rel="noreferrer" className="text-gold-600 font-bold">القناة الرسمية في تلغرام</a>.
        </p>
      </div>
    </>
  )
}
