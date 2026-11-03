import { useState } from 'react'
import { Link } from 'react-router-dom'
import { site } from '../config/site'
import { PageHeader, Button } from '../components/ui'

export default function Faq() {
  const [open, setOpen] = useState(0)
  const items = site.faq || []
  return (
    <>
      <PageHeader title="الأسئلة الشائعة" subtitle="إجابات سريعة عن أكثر ما يسأل عنه المراجعون" />
      <div className="container-x py-12 max-w-3xl">
        <div className="space-y-3">
          {items.map(([q, a], i) => (
            <div key={q} className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden">
              <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i} className="w-full text-start p-5 flex items-center justify-between gap-4 font-extrabold text-navy-900">
                <span>{q}</span><span className="text-gold-600 text-xl shrink-0">{open === i ? '−' : '+'}</span>
              </button>
              {open === i && <div className="px-5 pb-5 text-slate-700 leading-loose whitespace-pre-line fade-in">{a}</div>}
            </div>
          ))}
        </div>
        <div className="text-center mt-10 flex flex-wrap gap-3 justify-center">
          <Button as={Link} to="/requests" variant="navy">تقديم طلب أو شكوى</Button>
          <Button as={Link} to="/contact" variant="ghost">تواصل معنا</Button>
        </div>
      </div>
    </>
  )
}
