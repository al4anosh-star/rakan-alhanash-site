import { site } from '../config/site'
import { getList } from '../lib/api'
import { fmtDate } from '../lib/utils'
import { PageHeader, Loader, Empty, useAsync } from '../components/ui'

const statusColor = { 'تحقق': 'bg-green-100 text-green-800', 'قيد العمل': 'bg-amber-100 text-amber-800', 'متعثر': 'bg-red-100 text-red-800', 'لم يبدأ': 'bg-slate-100 text-slate-700' }
const cfg = {
  pledges: { title: 'متابعة التعهدات', sub: 'التعهدات المعلنة وحالة كل منها بشفافية' },
  events: { title: 'المواعيد واللقاءات', sub: 'اللقاءات العامة ومواعيد المكتب' },
  clarifications: { title: 'توضيحات رسمية', sub: 'ردود المكتب على المعلومات المتداولة' },
}

export default function Updates({ kind }) {
  const { data, loading } = useAsync(() => getList(kind), [kind])
  const c = cfg[kind]
  const items = [...(data || [])].sort((a, b) => (kind === 'events' ? (a.date || '').localeCompare(b.date || '') : 0))
  const count = (s) => items.filter((i) => i.status === s).length
  return (
    <>
      <PageHeader title={c.title} subtitle={c.sub} />
      <div className="container-x py-12 max-w-4xl">
        {kind === 'events' && (
          <div className="bg-gold-500/10 rounded-xl p-5 mb-8 text-center"><b className="text-navy-900">دوام المكتب:</b> {site.officeHours} · {site.address}</div>
        )}
        {kind === 'pledges' && items.length > 0 && (
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {Object.keys(statusColor).map((s) => <span key={s} className={`px-4 py-2 rounded-full font-bold text-sm ${statusColor[s]}`}>{s}: {count(s)}</span>)}
          </div>
        )}
        {loading ? <Loader /> : !items.length ? <Empty /> : (
          <div className="grid gap-4">
            {items.map((i) => (
              <div key={i.id} className="bg-white rounded-xl border border-black/5 shadow-sm p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-extrabold text-navy-900 text-lg">{i.title}</h3>
                  {kind === 'pledges' && <span className={`px-3 py-1 rounded-full text-sm font-bold ${statusColor[i.status] || ''}`}>{i.status}</span>}
                  {kind === 'events' && i.date && <span className="text-sm font-bold text-gold-600">{fmtDate(i.date)}</span>}
                  {kind === 'clarifications' && i.date && <span className="text-sm text-slate-500">{fmtDate(i.date)}</span>}
                </div>
                {kind === 'pledges' && <p className="text-slate-600 mt-2">{i.description}</p>}
                {kind === 'events' && <p className="text-slate-600 mt-2">{[i.place, i.note].filter(Boolean).join(' — ')}</p>}
                {kind === 'clarifications' && <><p className="text-slate-500 mt-2"><b>المتداول:</b> {i.claim}</p><p className="text-slate-800 mt-2"><b>التوضيح:</b> {i.answer}</p></>}
                {kind === 'pledges' && i.note && <p className="text-sm text-slate-500 mt-2">ملاحظة: {i.note}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
