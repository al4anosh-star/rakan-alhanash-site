import { getList } from '../lib/api'
import { asset } from '../lib/utils'
import { PageHeader, Loader, Empty, Cover, useAsync } from '../components/ui'

export default function Achievements() {
  const { data, loading } = useAsync(() => getList('achievements'))
  return (
    <>
      <PageHeader title="الإنجازات والمشاريع" subtitle="ثمرة العمل الميداني والمتابعة المستمرة" />
      <div className="container-x py-12">
        {loading ? <Loader /> : !data?.length ? <Empty /> : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((a) => (
              <div key={a.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-black/5">
                <Cover src={a.image_url} alt={a.title} />
                <div className="p-5">
                  <div className="flex gap-2 text-xs mb-2">
                    {a.category && <span className="bg-navy-900 text-white px-2.5 py-1 rounded-full">{a.category}</span>}
                    {a.year && <span className="bg-gold-500/15 text-gold-600 font-bold px-2.5 py-1 rounded-full">{a.year}</span>}
                  </div>
                  <h3 className="font-bold text-lg text-navy-900">{a.title}</h3>
                  <p className="text-slate-600 text-sm mt-2">{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
