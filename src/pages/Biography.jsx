import { Icon } from '../components/ui/icons'
import { site } from '../config/site'
import { getList, getSettings } from '../lib/api'
import { PageHeader, Timeline, Loader, useAsync, SectionTitle } from '../components/ui'

export default function Biography() {
  const tl = useAsync(() => getList('bio_timeline'))
  const st = useAsync(getSettings)
  const bio = st.data?.bio_text ||
    'وُلد ونشأ في بيئة عراقية أصيلة، وتشبّع منذ صغره بقيم الخدمة العامة وحب الوطن.'
  const items = tl.data || []
  const group = (k) => items.filter((i) => i.kind === k)

  return (
    <>
      <PageHeader title="السيرة الذاتية" subtitle={`${site.fullName} — ${site.title}`} />
      <div className="container-x py-14 grid md:grid-cols-3 gap-10">
        <aside className="md:col-span-1">
          <div className="sticky top-24 bg-white rounded-xl p-6 shadow-sm border border-black/5 text-center">
            <div className="size-40 mx-auto rounded-full overflow-hidden bg-navy-800 flex items-center justify-center">
              {site.photo ? <img src={site.photo} alt="" className="size-full object-cover" /> : <Icon name="user" className="size-20 text-gold-500/70" />}
            </div>
            <h2 className="mt-4 font-extrabold text-xl text-navy-900">{site.fullName}</h2>
            <p className="text-gold-600 font-bold">{site.title}</p>
          </div>
        </aside>
        <div className="md:col-span-2 space-y-12">
          <section>
            <h2 className="text-2xl font-extrabold text-navy-900 mb-4">النشأة</h2>
            <p className="leading-loose text-slate-700 whitespace-pre-line">{bio}</p>
          </section>
          {tl.loading ? <Loader /> : (
            <>
              {group('education').length > 0 && (
                <section>
                  <h2 className="text-2xl font-extrabold text-navy-900 mb-4">الشهادات العلمية</h2>
                  <ul className="grid gap-3">
                    {group('education').map((e) => (
                      <li key={e.id} className="bg-white rounded-lg p-4 border-s-4 border-gold-500 shadow-sm">
                        <b className="text-navy-900">{e.title}</b> <span className="text-sm text-gold-600">({e.year})</span>
                        {e.description && <p className="text-slate-600 text-sm mt-1">{e.description}</p>}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {group('position').length > 0 && (
                <section>
                  <h2 className="text-2xl font-extrabold text-navy-900 mb-4">المناصب</h2>
                  <ul className="grid gap-3">
                    {group('position').map((e) => (
                      <li key={e.id} className="bg-white rounded-lg p-4 border-s-4 border-navy-900 shadow-sm">
                        <b className="text-navy-900">{e.title}</b> <span className="text-sm text-gold-600">({e.year})</span>
                        {e.description && <p className="text-slate-600 text-sm mt-1">{e.description}</p>}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              <section>
                <h2 className="text-2xl font-extrabold text-navy-900 mb-6">المسيرة الزمنية</h2>
                <Timeline items={items} />
              </section>
            </>
          )}
        </div>
      </div>
    </>
  )
}
