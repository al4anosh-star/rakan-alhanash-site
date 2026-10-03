import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Icon } from './icons'
import { site } from '../../config/site'
import { asset, fmtDate, youtubeEmbed, isDirectVideo } from '../../lib/utils'

export function SectionTitle({ title, subtitle, light }) {
  return (
    <div className="text-center mb-10">
      <h2 className={`text-2xl md:text-4xl font-extrabold ${light ? 'text-white' : 'text-navy-900'}`}>{title}</h2>
      <div className="flex items-center justify-center gap-2 mt-3">
        <span className="h-px w-12 bg-gold-500" /><span className="size-2 rotate-45 bg-gold-500" /><span className="h-px w-12 bg-gold-500" />
      </div>
      {subtitle && <p className={`mt-3 ${light ? 'text-white/70' : 'text-slate-600'}`}>{subtitle}</p>}
    </div>
  )
}

export function PageHeader({ title, subtitle }) {
  return (
    <div className="bg-navy-900 text-white py-12 md:py-16 text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,#b08d3c,transparent_40%)]" />
      <div className="container-x relative">
        <h1 className="text-3xl md:text-5xl font-extrabold">{title}</h1>
        {subtitle && <p className="mt-3 text-white/70 max-w-2xl mx-auto">{subtitle}</p>}
        <div className="mt-5 mx-auto h-1 w-20 bg-gold-500 rounded" />
      </div>
    </div>
  )
}

export function Button({ as: As = 'button', variant = 'gold', className = '', ...p }) {
  const v = {
    gold: 'bg-gold-500 text-navy-950 hover:bg-gold-300',
    navy: 'bg-navy-900 text-white hover:bg-navy-700',
    outline: 'border border-white/60 text-white hover:bg-white/10',
    ghost: 'border border-navy-900/20 text-navy-900 hover:bg-navy-900/5',
  }[variant]
  return <As className={`inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-bold transition disabled:opacity-60 ${v} ${className}`} {...p} />
}

export function Loader() {
  return <div className="py-20 flex justify-center"><div className="size-10 rounded-full border-4 border-gold-500/30 border-t-gold-500 animate-spin" /></div>
}

export function Empty({ text = 'لا توجد بيانات حالياً' }) {
  return <p className="text-center text-slate-500 py-16">{text}</p>
}

export function Cover({ src, alt = '', className = 'aspect-[16/10]' }) {
  return (
    <div className={`${src ? className : 'h-20'} bg-navy-800 overflow-hidden`}>
      {src ? <img src={asset(src)} alt={alt} loading="lazy" className="size-full object-cover group-hover:scale-105 transition duration-500" />
        : <div className="size-full bg-gradient-to-l from-navy-900 to-navy-700 flex items-center justify-center border-b-2 border-gold-500"><img src={asset(site.logo)} alt="" className="size-12 opacity-90" /></div>}
    </div>
  )
}

export function NewsCard({ n }) {
  return (
    <Link to={`/news/${n.id}`} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition border border-black/5 flex flex-col">
      <Cover src={n.image_url} alt={n.title} />
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-3 text-xs mb-2">
          {n.category && <span className="bg-gold-500/15 text-gold-600 font-bold px-2.5 py-1 rounded-full">{n.category}</span>}
          <span className="text-slate-500">{fmtDate(n.published_at)}</span>
        </div>
        <h3 className="font-bold text-lg text-navy-900 leading-snug group-hover:text-gold-600 transition">{n.title}</h3>
        <p className="text-slate-600 text-sm mt-2 line-clamp-3">{n.summary}</p>
      </div>
    </Link>
  )
}

export function Timeline({ items }) {
  const icon = { birth: 'user', education: 'cap', position: 'building' }
  return (
    <ol className="relative border-s-2 border-gold-500/40 ms-4 space-y-8">
      {items.map((t) => (
        <li key={t.id} className="ps-8 relative">
          <span className="absolute -start-[1.15rem] top-0 size-9 rounded-full bg-navy-900 flex items-center justify-center ring-4 ring-paper"><Icon name={icon[t.kind] || 'shield'} className="size-4 text-gold-300" /></span>
          {t.year && <span className="text-gold-600 font-bold text-sm">{t.year}</span>}
          <h3 className="font-bold text-lg text-navy-900">{t.title}</h3>
          {t.description && <p className="text-slate-600 mt-1">{t.description}</p>}
        </li>
      ))}
    </ol>
  )
}

export function VideoEmbed({ url, title }) {
  const yt = youtubeEmbed(url)
  if (yt) return <iframe src={yt} title={title} loading="lazy" allowFullScreen className="size-full" />
  if (isDirectVideo(url)) return <video src={url} controls preload="metadata" className="size-full" />
  return <a href={url} target="_blank" rel="noreferrer" className="size-full flex items-center justify-center text-white underline">فتح الفيديو</a>
}

export function Lightbox({ src, onClose }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  if (!src) return null
  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={onClose}>
      <button className="absolute top-4 start-4 text-white text-3xl" aria-label="إغلاق">×</button>
      <img src={src} alt="" className="max-h-full max-w-full rounded-lg" />
    </div>
  )
}

export function useAsync(fn, deps = []) {
  const [state, set] = useState({ data: null, loading: true, error: null })
  useEffect(() => {
    let alive = true
    set((s) => ({ ...s, loading: true }))
    fn().then((data) => alive && set({ data, loading: false, error: null }))
        .catch((error) => alive && set({ data: null, loading: false, error }))
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return state
}
