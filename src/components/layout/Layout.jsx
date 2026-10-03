import { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { site } from '../../config/site'
import { SocialIcon, socialLabels } from '../ui/icons'
import { asset } from '../../lib/utils'

const links = [
  ['/', 'الرئيسية'], ['/biography', 'السيرة الذاتية'], ['/news', 'الأخبار'],
  ['/gallery', 'المعرض'], ['/achievements', 'الإنجازات'], ['/requests', 'طلبات المواطنين'], ['/completed', 'المعاملات المنجزة'], ['/contact', 'تواصل معنا'],
]

function Brand({ light }) {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label={site.fullName}>
      <img src={asset(site.logo)} alt="" className="size-11 shrink-0" />
      <span className="leading-tight">
        <img src={asset(light ? site.nameImageWhite : site.nameImage)} alt={site.fullName} className="h-8 w-auto max-w-[190px]" />
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
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-black/5 shadow-sm">
        <div className="container-x flex items-center justify-between h-16">
          <Brand />
          <nav className="hidden lg:flex items-center gap-1">
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-bold transition ${isActive ? 'text-gold-600 bg-gold-500/10' : 'text-navy-900 hover:text-gold-600'}`}>{label}</NavLink>
            ))}
          </nav>
          <button className="lg:hidden size-10 text-2xl text-navy-900" onClick={() => setOpen(!open)} aria-label="القائمة"><Icon name={open ? 'close' : 'menu'} className="size-6 mx-auto" /></button>
        </div>
        {open && (
          <nav className="lg:hidden border-t bg-white fade-in">
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) =>
                `block px-6 py-3.5 border-b border-black/5 font-bold ${isActive ? 'text-gold-600 bg-gold-500/10' : 'text-navy-900'}`}>{label}</NavLink>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1"><Outlet /></main>

      <footer className="bg-navy-950 text-white/80 mt-16">
        <div className="container-x py-12 grid gap-8 md:grid-cols-3">
          <div>
            <Brand light />
            <p className="mt-4 text-sm leading-relaxed">{site.slogan}</p>
            <div className="mt-4 inline-block bg-white rounded-lg p-2"><img src={asset(site.committeeLogo)} alt="شعار لجنة النزاهة النيابية" className="h-14 w-auto" /></div>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3">روابط سريعة</h4>
            <ul className="space-y-2 text-sm">
              {links.slice(1).map(([to, l]) => <li key={to}><Link to={to} className="hover:text-gold-300">{l}</Link></li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3">تواصل معنا</h4>
            <p className="text-sm" dir="ltr" style={{ textAlign: 'right' }}>{site.phone}</p>
            <p className="text-sm mt-1">{site.email}</p>
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
            <span dir="ltr" className="text-white/60 tracking-wide">
              Designed &amp; Built by <span className="text-gold-300 font-semibold">Mohammed Alsaadoon</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
