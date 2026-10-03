import { site } from '../config/site'
import { PageHeader } from '../components/ui'
import { SocialIcon, socialLabels, Icon } from '../components/ui/icons'

export default function Contact() {
  const rows = [['phone', 'الهاتف', site.phone, `tel:${site.phone.replace(/\s/g, '')}`], ['mail', 'البريد الإلكتروني', site.email, `mailto:${site.email}`], ['pin', 'العنوان', site.address], ['clock', 'أوقات دوام المكتب', site.officeHours]]
  return (
    <>
      <PageHeader title="تواصل معنا" subtitle="قنوات التواصل الرسمية مع مكتب النائب" />
      <div className="container-x py-12 grid md:grid-cols-2 gap-8 max-w-4xl">
        <div className="space-y-4">
          {rows.filter((r) => r[2]).map(([i, l, v, href]) => (
            <div key={l} className="bg-white rounded-xl p-5 flex items-center gap-4 shadow-sm border border-black/5">
              <span className="size-12 rounded-full bg-gold-500/15 flex items-center justify-center text-gold-600"><Icon name={i} className="size-6" /></span>
              <div><div className="text-sm text-slate-500">{l}</div>
                {href ? <a href={href} dir="ltr" className="font-bold text-navy-900 block text-right">{v}</a> : <b className="text-navy-900">{v}</b>}</div>
            </div>
          ))}
        </div>
        <div className="bg-navy-900 rounded-xl p-6 text-white">
          <h3 className="font-extrabold text-lg mb-4">الحسابات الرسمية</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(site.social).map(([k, v]) => (
              <a key={k} href={v} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-white/10 hover:bg-gold-500 hover:text-navy-950 rounded-lg px-4 py-3 transition font-bold">
                <SocialIcon name={k} />{socialLabels[k]}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
