import { Link } from 'react-router-dom'
import { site } from '../config/site'
import { getNews } from '../lib/api'
import { asset, fmtDate } from '../lib/utils'
import { PageHeader, SectionTitle, Loader, useAsync } from '../components/ui'

export default function Media() {
  const { data, loading } = useAsync(() => getNews())
  const statements = (data || []).filter((n) => n.category === 'بيانات').slice(0, 5)
  return (
    <>
      <PageHeader title="الركن الإعلامي" subtitle="معلومات رسمية وملفات جاهزة للصحفيين والجهات الإعلامية" />
      <div className="container-x py-12 max-w-5xl space-y-14">
        {site.mediaFacts?.length > 0 && (
          <section>
            <SectionTitle title="نبذة رسمية موجزة" />
            <div className="bg-white rounded-xl border border-black/5 shadow-sm divide-y divide-black/10">
              {site.mediaFacts.map(([k, v]) => (
                <div key={k} className="grid grid-cols-3 gap-4 p-4">
                  <div className="font-bold text-navy-900">{k}</div>
                  <div className="col-span-2 text-slate-700">{v}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {site.mediaKit?.length > 0 && (
          <section>
            <SectionTitle title="ملفات للتحميل" subtitle="للاستخدام الإعلامي مع ذكر المصدر" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {site.mediaKit.map((f) => (
                <a key={f.file} href={asset(f.file)} download className="group bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden hover:border-gold-500 transition">
                  <div className="h-40 bg-[repeating-conic-gradient(#eee_0_25%,#fff_0_50%)] bg-[length:20px_20px] flex items-center justify-center p-4">
                    <img src={asset(f.file)} alt={f.label} loading="lazy" className="max-h-full max-w-full object-contain" style={f.dark ? { background: '#071c39', padding: 8, borderRadius: 8 } : undefined} />
                  </div>
                  <div className="p-4"><b className="text-navy-900">{f.label}</b><p className="text-sm text-slate-500 mt-1">{f.hint}</p><span className="text-gold-600 font-bold text-sm mt-2 inline-block">تحميل ↓</span></div>
                </a>
              ))}
            </div>
          </section>
        )}

        <section>
          <SectionTitle title="آخر البيانات" />
          {loading ? <Loader /> : statements.length ? (
            <div className="grid gap-3">
              {statements.map((n) => (
                <Link key={n.id} to={`/news/${n.id}`} className="bg-white rounded-lg border border-black/5 shadow-sm p-4 hover:border-gold-500 transition">
                  <div className="font-bold text-navy-900">{n.title}</div>
                  <div className="text-sm text-slate-500 mt-1">{fmtDate(n.published_at)}</div>
                </Link>
              ))}
            </div>
          ) : <p className="text-center text-slate-500">لا توجد بيانات منشورة بعد.</p>}
        </section>

        <section className="bg-navy-900 text-white rounded-xl p-6 md:p-8 text-center">
          <h3 className="text-xl font-extrabold">للتواصل الإعلامي</h3>
          <p className="text-white/80 mt-2">{site.officeHours}</p>
          <p className="mt-3 font-bold" dir="ltr">{site.phone} · {site.email}</p>
        </section>
      </div>
    </>
  )
}
