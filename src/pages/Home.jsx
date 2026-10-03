import { Link } from 'react-router-dom'
import { Icon } from '../components/ui/icons'
import { site } from '../config/site'
import { getNews, getSettings, getRequestStats } from '../lib/api'
import { fmtNum, asset } from '../lib/utils'
import { Button, SectionTitle, NewsCard, Loader, useAsync } from '../components/ui'

export default function Home() {
  const news = useAsync(() => getNews({ limit: 3 }))
  const settings = useAsync(getSettings)
  const live = useAsync(getRequestStats)
  const liveStats = live.data && Number(live.data.total) > 0
    ? [{ label: 'طلب مواطن مستلم', value: Number(live.data.total) }, { label: 'طلب منجز', value: Number(live.data.done) }] : []
  const stats = [...(settings.data?.stats?.length ? settings.data.stats : []), ...liveStats]
  const welcome = settings.data?.welcome || site.welcome

  return (
    <>
      <section className="bg-navy-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_80%_20%,#b08d3c,transparent_45%)]" />
        <div className="container-x relative grid md:grid-cols-2 gap-10 items-center py-14 md:py-24">
          <div className="fade-in order-2 md:order-1">
            <span className="inline-block border border-gold-500 text-gold-300 rounded-full px-4 py-1 text-sm mb-5">{site.title}</span>
            <h1 className="sr-only">{site.fullName}</h1>
            <img src={asset(site.nameImageWhite)} alt="" aria-hidden="true" className="w-full max-w-xl h-auto" />
            <p className="mt-4 text-xl text-gold-300 font-display">{site.slogan}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button as={Link} to="/requests">تقديم طلب أو شكوى</Button>
              <Button as={Link} to="/biography" variant="outline">السيرة الذاتية</Button>
            </div>
          </div>
          <div className="order-1 md:order-2 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-3 rounded-full border-2 border-gold-500/60" />
              <div className="size-64 md:size-96 rounded-full overflow-hidden bg-navy-700 flex items-center justify-center ring-8 ring-white/5">
                {site.photo ? <img src={asset(site.photo)} alt={site.fullName} className="size-full object-cover" /> : <Icon name="user" className="size-32 text-gold-500/70" />}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x py-16 text-center max-w-3xl">
        <SectionTitle title="كلمة ترحيبية" />
        <p className="text-lg leading-loose text-slate-700">{welcome}</p>
      </section>

      {stats.length > 0 && (
        <section className="bg-navy-900 py-14">
          <div className="container-x grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl md:text-5xl font-extrabold text-gold-500 font-display">{fmtNum(s.value)}</div>
                <div className="mt-2 text-white/80">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="container-x py-16">
        <SectionTitle title="آخر الأخبار" subtitle="تابع أحدث نشاطاتنا وفعالياتنا" />
        {news.loading ? <Loader /> : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{news.data?.map((n) => <NewsCard key={n.id} n={n} />)}</div>
        )}
        <div className="text-center mt-10"><Button as={Link} to="/news" variant="navy">جميع الأخبار</Button></div>
      </section>

      <section className="bg-gold-500/10 py-14">
        <div className="container-x text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-navy-900">تقديم الطلبات والشكاوى</h2>
          <p className="mt-2 text-slate-600">يمكن للمواطنين تقديم طلباتهم وشكاواهم إلكترونياً والحصول على رقم متابعة للاستعلام عن حالتها.</p>
          <Button as={Link} to="/requests" variant="navy" className="mt-6">تقديم طلب</Button>
        </div>
      </section>
    </>
  )
}
