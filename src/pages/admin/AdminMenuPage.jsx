import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import AdminPageShell from './AdminPageShell'
import AdminIcon from '../../components/AdminIcon'
import { createMenuItem, deleteMenuItem, updateMenuItem } from '../../lib/menuApi'
import { getMenuAdmin } from '../../lib/adminApi'
import { useMenu } from '../../context/MenuContext'

const initial = { name: '', category: 'Makanan', price: '', hpp: '', stock: 0, pcsPerMika: 1, badge: '', description: '', available: true, hasVariant: false, variants: [] }
const currency = n => `Rp ${Number(n || 0).toLocaleString('id-ID')}`
const inputClass = 'w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-indigo-400/40 dark:focus:ring-indigo-500/10'
const labelClass = 'mb-2 block text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400'

export default function AdminMenuPage() {
  const { id } = useParams()
  const { refresh } = useMenu()
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(initial)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const load = async () => {
    try { setError(''); const data = await getMenuAdmin(); setItems(data.items || []) }
    catch (e) { setError(e?.message || 'Gagal memuat menu.') }
  }
  useEffect(() => { load() }, [])
  useEffect(() => { if (id && items.length) { const found = items.find(x => String(x.id) === String(id)); if (found && !editing) edit(found) } }, [id, items])
  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))
  const reset = () => { setEditing(null); setForm({ ...initial, variants: [] }) }
  const edit = item => { setEditing(item); setForm({ name: item.name, category: item.category, price: item.price, hpp: item.hpp || 0, stock: item.stock || 0, pcsPerMika: item.pcsPerMika || 1, badge: item.badge || '', description: item.description || '', available: item.available !== false, hasVariant: Boolean(item.hasVariant), variants: item.variants || [] }); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const submit = async e => {
    e.preventDefault(); setBusy(true); setError('')
    try {
      const payload = { ...form, name: form.name.trim(), price: Number(form.price), hpp: Number(form.hpp || 0), stock: Number(form.stock || 0), pcsPerMika: Number(form.pcsPerMika || 1), variants: form.hasVariant ? form.variants.filter(v => String(v.label || '').trim()) : [] }
      if (editing) await updateMenuItem(editing.id, payload); else await createMenuItem(payload)
      reset(); await load(); await refresh()
    } catch (e) { setError(e?.message || 'Gagal menyimpan menu.') }
    finally { setBusy(false) }
  }
  const remove = async item => {
    if (!window.confirm(`Nonaktifkan menu "${item.name}"?`)) return
    try { setError(''); await deleteMenuItem(item.id); await load(); await refresh() }
    catch (e) { setError(e?.message || 'Gagal menonaktifkan menu.') }
  }
  return <AdminPageShell title="Menu" subtitle="Kelola menu yang tampil di website pelanggan, termasuk harga, stok, HPP, dan varian.">
    {error ? <div className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-400/15 dark:bg-rose-500/10 dark:text-rose-300"><AdminIcon name="alert" size={18} className="mt-0.5 shrink-0"/><span>{error}</span></div> : null}
    <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
      <form onSubmit={submit} className="rounded-[30px] border border-white/70 bg-white/65 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3"><div><div className="mb-2 flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"><AdminIcon name={editing ? 'edit' : 'plus'} size={17}/></span><h2 className="text-lg font-black text-slate-900 dark:text-white">{editing ? 'Edit Menu' : 'Tambah Menu'}</h2></div><p className="text-xs font-medium text-slate-400">Semua perubahan tersimpan ke Supabase.</p></div></div>
        <div className="space-y-4">
          <label className="block"><span className={labelClass}>Nama Menu</span><input className={inputClass} value={form.name} onChange={e=>set('name',e.target.value)} required/></label>
          <label className="block"><span className={labelClass}>Kategori</span><select className={inputClass} value={form.category} onChange={e=>set('category',e.target.value)}>{['Makanan','Minuman','Paket','Lainnya'].map(x=><option key={x}>{x}</option>)}</select></label>
          <div className="grid grid-cols-2 gap-3"><label><span className={labelClass}>Harga Jual</span><input className={inputClass} type="number" min="0" value={form.price} onChange={e=>set('price',e.target.value)} required/></label><label><span className={labelClass}>HPP / Modal</span><input className={inputClass} type="number" min="0" value={form.hpp} onChange={e=>set('hpp',e.target.value)}/></label></div>
          <div className="grid grid-cols-2 gap-3"><label><span className={labelClass}>Stok</span><input className={inputClass} type="number" min="0" value={form.stock} onChange={e=>set('stock',e.target.value)}/></label><label><span className={labelClass}>Isi per Mika</span><input className={inputClass} type="number" min="1" value={form.pcsPerMika} onChange={e=>set('pcsPerMika',e.target.value)}/></label></div>
          <label className="block"><span className={labelClass}>Badge</span><input className={inputClass} value={form.badge} onChange={e=>set('badge',e.target.value)} placeholder="Best Seller"/></label>
          <label className="block"><span className={labelClass}>Deskripsi</span><textarea className={`${inputClass} resize-y`} rows="3" value={form.description} onChange={e=>set('description',e.target.value)}/></label>
          <div className="space-y-2 rounded-2xl bg-slate-50/80 p-3 dark:bg-white/5">
            <label className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-bold text-slate-700 dark:text-slate-200"><input type="checkbox" className="h-4 w-4 accent-indigo-600" checked={form.available} onChange={e=>set('available',e.target.checked)}/> Aktif di website</label>
            <label className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-bold text-slate-700 dark:text-slate-200"><input type="checkbox" className="h-4 w-4 accent-indigo-600" checked={form.hasVariant} onChange={e=>set('hasVariant',e.target.checked)}/> Menggunakan varian</label>
          </div>
          {form.hasVariant ? <div className="rounded-2xl bg-slate-50/80 p-3 dark:bg-white/5"><div className="mb-3 flex items-center justify-between"><p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Daftar Varian</p><button type="button" className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-black text-white transition hover:bg-indigo-700" onClick={()=>set('variants',[...form.variants,{label:'',price:0}])}><AdminIcon name="plus" size={14} className="mr-1 inline"/> Varian</button></div><div className="space-y-2">{form.variants.map((v,i)=><div className="grid grid-cols-[1fr_110px_40px] gap-2" key={`${i}-${v.label}`}><input className={inputClass} placeholder="Nama" value={v.label} onChange={e=>set('variants',form.variants.map((x,j)=>j===i?{...x,label:e.target.value}:x))}/><input className={inputClass} type="number" min="0" placeholder="Tambah" value={v.price} onChange={e=>set('variants',form.variants.map((x,j)=>j===i?{...x,price:Number(e.target.value||0)}:x))}/><button type="button" className="flex items-center justify-center rounded-2xl bg-rose-50 text-rose-600 transition hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300" onClick={()=>set('variants',form.variants.filter((_,j)=>j!==i))}><AdminIcon name="trash" size={16}/></button></div>)}</div></div> : null}
        </div>
        <div className="mt-5 flex gap-2"><button type="button" className="flex-1 rounded-2xl border border-white/70 bg-white/75 px-4 py-3 text-sm font-black text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200" onClick={reset}>Bersihkan</button><button type="submit" disabled={busy} className="flex-1 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-60 dark:shadow-indigo-950/30">{busy ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Tambah Menu'}</button></div>
      </form>

      <div className="min-w-0 rounded-[30px] border border-white/70 bg-white/65 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:p-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-black text-slate-900 dark:text-white">Daftar Menu</h2><p className="text-xs font-medium text-slate-400">{items.length} menu terdaftar.</p></div><button type="button" onClick={load} className="flex w-fit items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300"><AdminIcon name="refresh" size={14}/> Refresh</button></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left text-sm"><thead><tr className="border-b border-slate-200/70 text-[10px] font-black uppercase tracking-[0.13em] text-slate-400 dark:border-white/10 dark:text-slate-500"><th className="px-3 py-3">Menu</th><th className="px-3 py-3">Kategori</th><th className="px-3 py-3">Harga</th><th className="px-3 py-3">HPP</th><th className="px-3 py-3">Stok</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Aksi</th></tr></thead><tbody>{items.map(item=><tr key={item.id} className="border-b border-slate-200/60 last:border-0 dark:border-white/5"><td className="px-3 py-3"><p className="font-black text-slate-800 dark:text-white">{item.name}</p>{item.badge?<p className="mt-1 text-[10px] font-semibold text-indigo-500">{item.badge}</p>:null}</td><td className="px-3 py-3 text-slate-600 dark:text-slate-300">{item.category}</td><td className="px-3 py-3 font-bold text-slate-800 dark:text-slate-200">{currency(item.price)}</td><td className="px-3 py-3 text-slate-600 dark:text-slate-300">{currency(item.hpp)}</td><td className="px-3 py-3 font-bold text-slate-800 dark:text-slate-200">{item.stock} pcs</td><td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${item.available ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400'}`}>{item.available ? 'Aktif' : 'Nonaktif'}</span></td><td className="px-3 py-3"><div className="flex gap-1"><button type="button" className="rounded-xl p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-500/10" onClick={()=>edit(item)} aria-label={`Edit ${item.name}`}><AdminIcon name="edit" size={16}/></button><button type="button" className="rounded-xl p-2 text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10" onClick={()=>remove(item)} aria-label={`Nonaktifkan ${item.name}`}><AdminIcon name="trash" size={16}/></button></div></td></tr>)}{!items.length?<tr><td colSpan="7" className="px-3 py-12 text-center text-sm font-semibold text-slate-400">Belum ada menu.</td></tr>:null}</tbody></table></div>
      </div>
    </div>
  </AdminPageShell>
}
