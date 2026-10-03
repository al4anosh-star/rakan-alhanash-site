import { useEffect, useState } from 'react'
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { supabase, isConfigured, isLocal } from '../lib/supabase'
import { isAdminUser, localLogin, localLogout } from '../lib/api'
import { Button, Loader } from '../components/ui'

export function AdminLogin() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  async function go(e) {
    e.preventDefault(); setErr('')
    if (isLocal) {
      try { await localLogin(email, password); return nav('/admin') } catch (e) { return setErr(e.message) }
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return setErr('بيانات الدخول غير صحيحة')
    if (!(await isAdminUser())) { await supabase.auth.signOut(); return setErr('هذا الحساب ليس أدمن') }
    nav('/admin')
  }
  if (!isConfigured && !isLocal) return <Navigate to="/admin" replace />
  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <form onSubmit={go} className="bg-white rounded-xl p-8 w-full max-w-sm grid gap-4">
        <h1 className="text-2xl font-extrabold text-navy-900 text-center">دخول لوحة التحكم</h1>
        <input required type={isLocal ? 'text' : 'email'} dir="ltr" placeholder={isLocal ? 'اسم المستخدم' : 'البريد الإلكتروني'} className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input required type="password" dir="ltr" placeholder="كلمة المرور" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && <p className="text-red-600 text-sm font-bold">{err}</p>}
        <Button type="submit" variant="navy">دخول</Button>
      </form>
    </div>
  )
}

export function AdminLayout() {
  const nav = useNavigate()
  const [ok, setOk] = useState(null)
  useEffect(() => { isAdminUser().then((v) => (v ? setOk(true) : nav('/admin/login'))) }, [nav])
  if (!ok) return <Loader />
  const tabs = [['requests', 'طلبات المواطنين'], ['reports', 'التقارير'], ['completed', 'المعاملات المنجزة'], ['news', 'الأخبار'], ['gallery', 'المعرض'], ['achievements', 'الإنجازات'], ['timeline', 'السيرة'], ['settings', 'الإعدادات']]
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-navy-900 text-white">
        <div className="container-x flex items-center justify-between h-14">
          <b>لوحة التحكم {!isConfigured && !isLocal && <span className="ms-2 text-xs bg-gold-500 text-navy-950 px-2 py-0.5 rounded">وضع المعاينة — البيانات غير محفوظة</span>}</b>
          <div className="flex gap-4 text-sm">
            <a href="/" className="hover:text-gold-300">عرض الموقع</a>
            <button onClick={async () => { localLogout(); await supabase?.auth.signOut(); nav('/admin/login') }} className="hover:text-gold-300">خروج</button>
          </div>
        </div>
        <nav className="container-x flex gap-1 overflow-x-auto pb-2">
          {tabs.map(([to, l]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `px-4 py-2 rounded-md text-sm font-bold whitespace-nowrap ${isActive ? 'bg-gold-500 text-navy-950' : 'hover:bg-white/10'}`}>{l}</NavLink>
          ))}
        </nav>
      </header>
      <div className="container-x py-6"><Outlet /></div>
    </div>
  )
}
