import { useState } from 'react'
import { getList } from '../lib/api'
import { PageHeader, Loader, Empty, Lightbox, VideoEmbed, useAsync } from '../components/ui'

export default function Gallery() {
  const { data, loading } = useAsync(() => getList('gallery'))
  const [tab, setTab] = useState('image')
  const [box, setBox] = useState(null)
  const items = (data || []).filter((i) => i.type === tab)
  return (
    <>
      <PageHeader title="معرض الصور والفيديو" />
      <div className="container-x py-10">
        <div className="flex justify-center gap-2 mb-8">
          {[['image', 'الصور'], ['video', 'الفيديو']].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`px-6 py-2 rounded-full font-bold ${tab === k ? 'bg-navy-900 text-white' : 'bg-white border'}`}>{l}</button>
          ))}
        </div>
        {loading ? <Loader /> : !items.length ? <Empty /> : tab === 'image' ? (
          <div className="columns-2 md:columns-3 gap-4 [&>*]:mb-4">
            {items.map((i) => (
              <button key={i.id} onClick={() => setBox(i.url)} className="block w-full overflow-hidden rounded-lg group">
                <img src={i.url} alt={i.title || ''} loading="lazy" className="w-full group-hover:scale-105 transition duration-500" />
              </button>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {items.map((i) => (
              <div key={i.id}>
                <div className="aspect-video bg-black rounded-xl overflow-hidden"><VideoEmbed url={i.url} title={i.title} /></div>
                {i.title && <p className="mt-2 font-bold text-navy-900">{i.title}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
      <Lightbox src={box} onClose={() => setBox(null)} />
    </>
  )
}
