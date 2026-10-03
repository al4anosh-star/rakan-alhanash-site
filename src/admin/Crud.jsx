import { useEffect, useState } from 'react'
import { adminList, adminSave, adminDelete, uploadFile } from '../lib/api'
import { Button, Loader } from '../components/ui'

// مدير عام للإضافة والتعديل والحذف — يعتمد على تعريف الحقول
export default function Crud({ table, title, fields, columns, order = 'created_at', defaults = {} }) {
  const [rows, setRows] = useState(null)
  const [form, setForm] = useState(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  const load = () => adminList(table, order).then(setRows).catch((e) => setMsg(e.message))
  useEffect(() => { load() }, [table])

  async function onFile(key, file) {
    if (!file) return
    setBusy(true)
    try { setForm((f) => ({ ...f, [key]: '' })); const url = await uploadFile('site', file); setForm((f) => ({ ...f, [key]: url })) }
    catch (e) { setMsg(e.message) }
    setBusy(false)
  }

  async function save(e) {
    e.preventDefault(); setBusy(true); setMsg('')
    try { await adminSave(table, form); setForm(null); await load() } catch (e) { setMsg(e.message) }
    setBusy(false)
  }

  async function del(id) {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    try { await adminDelete(table, id); await load() } catch (e) { setMsg(e.message) }
  }

  if (!rows) return <Loader />
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-extrabold text-navy-900">{title}</h2>
        <Button variant="navy" onClick={() => setForm({ ...defaults })}>+ إضافة</Button>
      </div>
      {msg && <p className="text-red-600 font-bold mb-3">{msg}</p>}

      {form && (
        <form onSubmit={save} className="bg-white rounded-xl p-5 mb-6 grid gap-4 shadow-sm">
          {fields.map((f, i) => (
            <label key={f.key + i} className="block">
              <span className="block mb-1 text-sm font-bold">{f.label}</span>
              {f.type === 'textarea' ? <textarea rows={5} className="input" value={form[f.key] ?? ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                : f.type === 'select' ? (
                  <select className="input" value={form[f.key] ?? ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}>
                    {f.options.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
                  </select>
                ) : f.type === 'image' ? (
                  <div className="flex items-center gap-3">
                    {form[f.key] && <img src={form[f.key]} className="h-16 rounded" alt="" />}
                    <input type="file" accept={f.accept || 'image/*'} className="input" onChange={(e) => onFile(f.key, e.target.files[0])} />
                  </div>
                ) : (
                  <input required={f.required} type={f.type || 'text'} className="input" value={form[f.key] ?? ''}
                    onChange={(e) => setForm({ ...form, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value })} />
                )}
            </label>
          ))}
          {form.published !== undefined && (
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> منشور</label>
          )}
          <div className="flex gap-2">
            <Button type="submit" disabled={busy}>{busy ? 'جارٍ الحفظ...' : 'حفظ'}</Button>
            <Button type="button" variant="ghost" onClick={() => setForm(null)}>إلغاء</Button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600"><tr>
            {columns.map((c) => <th key={c.key} className="text-start p-3">{c.label}</th>)}<th className="p-3" />
          </tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                {columns.map((c) => <td key={c.key} className="p-3 max-w-xs truncate">{c.render ? c.render(r) : r[c.key]}</td>)}
                <td className="p-3 whitespace-nowrap text-end">
                  <button className="text-blue-700 font-bold me-3" onClick={() => setForm(r)}>تعديل</button>
                  <button className="text-red-600 font-bold" onClick={() => del(r.id)}>حذف</button>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={columns.length + 1} className="p-8 text-center text-slate-500">لا توجد بيانات</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
