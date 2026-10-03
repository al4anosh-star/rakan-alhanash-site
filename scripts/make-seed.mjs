// يولّد supabase/seed.sql من البيانات الموجودة في src/lib/demo.js و src/config/site.js
import { writeFileSync } from 'node:fs'
import { demo } from '../src/lib/demo.js'
import { site } from '../src/config/site.js'

const q = (v) => (v === null || v === undefined || v === '' ? 'null' : `'${String(v).replace(/'/g, "''")}'`)
const out = ['-- بيانات أولية للموقع (مولّدة تلقائياً) — شغّلها بعد schema.sql', 'begin;']

out.push(`update site_settings set welcome=${q(site.welcome)}, bio_text=${q(demo.settings.bio_text)}, phone=${q(site.phone)}, email=${q(site.email)}, address=${q(site.address)}, social=${q(JSON.stringify(site.social))}::jsonb, stats=${q(JSON.stringify(demo.settings.stats))}::jsonb where id=1;`)
for (const n of demo.news)
  out.push(`insert into news (title,summary,content,image_url,category,published,published_at) values (${q(n.title)},${q(n.summary)},${q(n.content)},${q(n.image_url)},${q(n.category)},true,${q(n.published_at)});`)
for (const g of demo.gallery)
  out.push(`insert into gallery (type,url,title) values (${q(g.type)},${q(g.url)},${q(g.title)});`)
for (const a of demo.achievements)
  out.push(`insert into achievements (title,description,image_url,category,year) values (${q(a.title)},${q(a.description)},${q(a.image_url)},${q(a.category)},${a.year ?? 'null'});`)
demo.timeline.forEach((t, i) =>
  out.push(`insert into bio_timeline (year,title,description,kind,sort_order) values (${q(t.year)},${q(t.title)},${q(t.description)},${q(t.kind)},${i});`))
for (const c of demo.completed)
  out.push(`insert into completed_items (done_date,ministry,title) values (${q(c.done_date)},${q(c.ministry)},${q(c.title)});`)
out.push('commit;')
writeFileSync(new URL('../supabase/seed.sql', import.meta.url), out.join('\n') + '\n')
console.log('seed.sql written:', out.length - 3, 'statements')
