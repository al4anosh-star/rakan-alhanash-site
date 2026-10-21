import { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { site } from '../../config/site'
import { SocialIcon, socialLabels, Icon } from '../ui/icons'
import { asset } from '../../lib/utils'

const allLinks = [
  ['/', 'الرئيسية'], ['/biography', 'السيرة الذاتية'], ['/parliament', 'العمل النيابي'], ['/news', 'الأخبار'],
  ['/gallery', 'المعرض'], ['/achievements', 'الإنجازات'], ['/requests', 'طلبات المواطنين'], ['/completed', 'المعاملات المنجزة'], ['/contact', 'تواصل معنا'],
]
const links = allLinks.filter(([to]) => to !== '/parliament' || site.features?.parliament)

function Brand({ light }) {
  const img = light ? site.nameImageWhite : site.nameImage
  return (
    <Link to="/" className="flex items-center gap-3" aria-label={site.fullName}>
      <img src={asset(site.logo)} alt="" className="size-11 shrink-0" />
      <span className="leading-tight">
        {img ? <img src={asset(img)} alt={site.fullName} className="h-8 w-auto max-w-[190px]" />
          : <b className={`block font-display text-lg ${light ? 'text-white' : 'text-navy-900'}`}>{site.fullName}</b>}
        <span className={`block text-[11px] mt-0.5 ${light ? 'text-white/60' : 'text-slate-500'}`}>{site.title}</span>
      </span>
    </Link>
  )
}

export default function Layout() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => { setOpen(false); window.scrollTo(0, 0) }, [pathname])

  return (
    <div className="min-h-screen flex flex-col">
      {site.demoBanner && <div className="bg-gold-500 text-navy-950 text-center text-sm font-bold py-1.5 px-3">{site.demoBanner}</div>}
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:right-2 focus:z-[200] focus:bg-gold-500 focus:text-navy-950 focus:px-4 focus:py-2 focus:rounded">تخطّي إلى المحتوى</a>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-black/5 shadow-sm">
        <div className="container-x flex items-center justify-between h-16">
          <Brand />
          <nav className="hidden xl:flex items-center gap-1">
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) =>
                `px-2.5 py-2 rounded-md text-sm font-bold whitespace-nowrap transition ${isActive ? 'text-gold-600 bg-gold-500/10' : 'text-navy-900 hover:text-gold-600'}`}>{label}</NavLink>
            ))}
          </nav>
          <button className="xl:hidden size-10 text-2xl text-navy-900" onClick={() => setOpen(!open)} aria-label="القائمة"><Icon name={open ? 'close' : 'menu'} className="size-6 mx-auto" /></button>
        </div>
        {open && (
          <nav className="xl:hidden border-t bg-white fade-in">
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) =>
                `block px-6 py-3.5 border-b border-black/5 font-bold ${isActive ? 'text-gold-600 bg-gold-500/10' : 'text-navy-900'}`}>{label}</NavLink>
            ))}
          </nav>
        )}
      </header>

      <main id="main" className="flex-1"><Outlet /></main>
      <a href={site.social.whatsapp} target="_blank" rel="noreferrer" aria-label="راسلنا على واتساب" className="fixed bottom-5 left-5 z-40 size-14 rounded-full bg-[#25D366] text-white shadow-lg flex items-center justify-center hover:scale-105 transition"><SocialIcon name="whatsapp" className="size-8" /></a>

      <footer className="bg-navy-950 text-white/80 mt-16">
        <div className="container-x py-12 grid gap-8 md:grid-cols-3">
          <div>
            <Brand light />
            <p className="mt-4 text-sm leading-relaxed">{site.slogan}</p>
            {site.committeeLogo && <div className="mt-4 inline-block bg-white rounded-lg p-2"><img src={asset(site.committeeLogo)} alt="شعار لجنة النزاهة النيابية" className="h-14 w-auto" /></div>}
          </div>
          <div>
            <h4 className="font-bold text-white mb-3">روابط سريعة</h4>
            <ul className="space-y-2 text-sm">
              {links.slice(1).map(([to, l]) => <li key={to}><Link to={to} className="hover:text-gold-300">{l}</Link></li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3">تواصل معنا</h4>
            <a href={`tel:${site.phone}`} className="block text-sm hover:text-gold-300" dir="ltr" style={{ textAlign: 'right' }}>{site.phone}</a>
            <a href={`mailto:${site.email}`} className="block text-sm mt-1 hover:text-gold-300">{site.email}</a>
            <div className="flex gap-2 mt-4">
              {Object.entries(site.social).map(([k, v]) => (
                <a key={k} href={v} target="_blank" rel="noreferrer" aria-label={socialLabels[k]} className="size-9 rounded-full bg-white/10 hover:bg-gold-500 hover:text-navy-950 flex items-center justify-center transition"><SocialIcon name={k} className="size-4" /></a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
          © {new Date().getFullYear()} {site.fullName} — جميع الحقوق محفوظة
          <div className="mt-3 flex flex-col items-center gap-1">
            <span className="text-gold-300 font-bold text-sm">صنع في العراق</span>
            <span className="text-white/60">{site.designer.label}: <span className="text-gold-300 font-semibold">{site.designer.name}</span></span>
          </div>
        </div>
      </footer>
    </div>
  )
}
