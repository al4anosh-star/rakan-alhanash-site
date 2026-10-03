import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getNews, getNewsItem } from '../lib/api'
import { newsCategories } from '../config/site'
import { fmtDate } from '../lib/utils'
import { PageHeader, NewsCard, Loader, Empty, useAsync, Button } from '../components/ui'

export function News() {
  const [cat, setCat] = useState('')
  const { data, loading } = useAsync(() => getNews({ category: cat }), [cat])
  return (
    <>
      <PageHeader title="الأخبار والنشاطات" subtitle="آخر المستجدات والفعاليات" />
      <div className="container-x py-10">
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {['', ...newsCategories].map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`px-4 py-2 rounded-full text-sm font-bold transition ${cat === c ? 'bg-navy-900 text-white' : 'bg-white text-navy-900 border hover:border-gold-500'}`}>{c || 'الكل'}</button>
          ))}
        </div>
        {loading ? <Loader /> : !data?.length ? <Empty text="لا توجد أخبار في هذا التصنيف" /> : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{data.map((n) => <NewsCard key={n.id} n={n} />)}</div>
        )}
      </div>
    </>
  )
}

export function NewsDetail() {
  const { id } = useParams()
  const { data: n, loading } = useAsync(() => getNewsItem(id), [id])
  if (loading) return <Loader />
  if (!n) return <Empty text="الخبر غير موجود" />
  return (
    <article className="container-x py-10 max-w-3xl">
      <Link to="/news" className="text-gold-600 font-bold">العودة إلى الأخبار</Link>
      <h1 className="text-3xl md:text-4xl font-extrabold text-navy-900 mt-4 leading-snug">{n.title}</h1>
      <div className="flex gap-3 text-sm text-slate-500 mt-3">
        {n.category && <span className="text-gold-600 font-bold">{n.category}</span>}<span>{fmtDate(n.published_at)}</span>
      </div>
      {n.image_url && <img src={n.image_url} alt={n.title} className="w-full rounded-xl mt-6 shadow" />}
      <div className="mt-6 text-lg leading-loose text-slate-700 whitespace-pre-line">{n.content || n.summary}</div>
      <Button as={Link} to="/news" variant="navy" className="mt-8">كل الأخبار</Button>
    </article>
  )
}
