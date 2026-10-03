import { Link } from 'react-router-dom'
import { site } from '../config/site'
import { getNews } from '../lib/api'
import { fmtNum } from '../lib/utils'
import { Button, Loader, SectionTitle, PageHeader, useAsync } from '../components/ui'
import { Icon } from '../components/ui/icons'

// محاور المتابعة: مستخلصة من النشاط الموثّق في الأخبار
const axes = [
  { icon: 'shield', title: 'الأمن والاستقرار', text: 'زيارات متواصلة إلى مكافحة الإجرام والأمن الوطني وقيادة الشرطة في نينوى، ووكيل وزارة الداخلية، لبحث الواقع الأمني وتعزيز التنسيق.' },
  { icon: 'building', title: 'القضاء وسيادة القانون', text: 'لقاءات مع رئيس محكمة استئناف نينوى ووزير العدل لدعم استقلال القضاء وترسيخ العدالة.' },
  { icon: 'book', title: 'الخدمات والتعليم', text: 'متابعة قطاع الكهرباء مع توزيع كهرباء الشمال، والواقع التربوي مع قسم تربية الحدباء، ونقل مطالب وجهاء القراج إلى محافظ نينوى.' },
  { icon: 'user', title: 'معاملات المواطنين', text: 'متابعة معاملات الرعاية الاجتماعية والمعين المتفرغ وذوي الاحتياجات الخاصة لدى وزارات العمل والصحة والتربية والعدل والداخلية.' },
]

export default function Parliament() {
  const { data, loading } = useAsync(() => getNews())
  const news = data || []
  const visits = news.filter((n) => ['زيارات ميدانية', 'لقاءات'].includes(n.category)).length
  const batches = news.filter((n) => n.category === 'إنجاز المعاملات').length
  const latest = news.filter((n) => ['زيارات ميدانية', 'لقاءات'].includes(n.category)).slice(0, 4)
  const wa = site.social.whatsapp

  return (
    <>
      <PageHeader title="العمل النيابي" subtitle="التمثيل والرقابة ومتابعة شؤون أبناء نينوى" />
      <div className="container-x py-12 space-y-16">

        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-black/5">
            <h2 className="text-xl font-extrabold text-navy-900 mb-2">التمثيل النيابي</h2>
            <p className="text-slate-700 leading-loose">نائب عن محافظة نينوى في مجلس النواب العراقي، فاز في انتخابات عام 2025 عن قائمة «نينوى لأهلها» بحصوله على <b>13,804</b> صوتاً.</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-black/5">
            <h2 className="text-xl font-extrabold text-navy-900 mb-2">لجنة النزاهة النيابية</h2>
            <p className="text-slate-700 leading-loose">عضو في لجنة النزاهة النيابية، التي تُعنى بمتابعة ملفات النزاهة ومكافحة الفساد والرقابة على المال العام.</p>
          </div>
        </section>

        <section>
          <SectionTitle title="الإبلاغ عن الفساد والشكاوى" subtitle="يستقبل المكتب الشكاوى والبلاغات بسرية وشفافية، ويُتخذ ما يلزم وفق القانون" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-3xl mx-auto">
            {site.complaintAreas.map((a) => (
              <div key={a} className="bg-white rounded-lg border border-black/5 shadow-sm p-4 text-center font-bold text-navy-900">{a}</div>
            ))}
          </div>
          <div className="text-center mt-8 flex flex-wrap gap-3 justify-center">
            <Button as="a" href={wa} target="_blank" rel="noreferrer" variant="navy">تقديم بلاغ عبر واتساب</Button>
            <Button as={Link} to="/requests" variant="ghost">تقديم طلب أو شكوى</Button>
          </div>
          <p className="text-center text-sm text-slate-500 mt-4">للتواصل: <span dir="ltr">{site.phone}</span> · {site.email}</p>
        </section>

        <section>
          <SectionTitle title="محاور المتابعة" subtitle="مجالات العمل الموثّقة في نشاط المكتب" />
          <div className="grid sm:grid-cols-2 gap-5">
            {axes.map((a) => (
              <div key={a.title} className="bg-white rounded-xl p-6 shadow-sm border border-black/5 flex gap-4">
                <span className="size-12 shrink-0 rounded-full bg-navy-900 text-gold-300 flex items-center justify-center"><Icon name={a.icon} className="size-6" /></span>
                <div><h3 className="font-extrabold text-navy-900">{a.title}</h3><p className="text-slate-600 text-sm leading-relaxed mt-1">{a.text}</p></div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle title="حصيلة النشاط الموثّق" subtitle="أرقام تُحسب تلقائياً من الأخبار المنشورة في الموقع" />
          {loading ? <Loader /> : (
            <>
              <div className="flex flex-wrap justify-center gap-6 mb-8">
                {[[visits, 'زيارة ولقاء رسمي'], [batches, 'وجبة معاملات منجزة معلنة']].map(([v, l]) => (
                  <div key={l} className="bg-navy-900 text-white rounded-xl px-10 py-6 text-center min-w-48">
                    <div className="text-4xl font-extrabold text-gold-500 font-display">{fmtNum(v)}</div><div className="text-white/80 mt-1">{l}</div>
                  </div>
                ))}
              </div>
              <div className="grid gap-3 max-w-3xl mx-auto">
                {latest.map((n) => (
                  <Link key={n.id} to={`/news/${n.id}`} className="bg-white rounded-lg border border-black/5 shadow-sm p-4 hover:border-gold-500 transition">
                    <div className="font-bold text-navy-900">{n.title}</div><div className="text-sm text-slate-500 mt-1">{n.summary}</div>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-6"><Button as={Link} to="/news" variant="navy">جميع الأخبار</Button></div>
            </>
          )}
        </section>
      </div>
    </>
  )
}
