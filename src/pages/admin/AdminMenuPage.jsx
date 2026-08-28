import React,{useEffect,useState} from 'react'
import {useParams} from 'react-router-dom'
import AdminPageShell from './AdminPageShell'
import AdminIcon from '../../components/AdminIcon'
import {createMenuItem,deleteMenuItem,updateMenuItem} from '../../lib/menuApi'
import {getMenuAdmin} from '../../lib/adminApi'
import {useMenu} from '../../context/MenuContext'
import {useLiveRefresh} from '../../lib/liveRefresh'

const categories=['Makanan','Minuman','Paket','Lainnya']
const initial={name:'',category:'Makanan',price:'',badge:'',description:'',available:true,hasVariant:false,variants:[],imageFile:null}
const input='w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-indigo-400/40 dark:focus:ring-indigo-500/10'
const label='mb-2 block text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400'
const money=n=>`Rp ${Number(n||0).toLocaleString('id-ID')}`
const image64=file=>new Promise((resolve,reject)=>{
 if(!file)return resolve(null)
 if(!file.type.startsWith('image/'))return reject(new Error('File gambar tidak valid.'))
 const reader=new FileReader()
 reader.onerror=()=>reject(new Error('Gagal membaca gambar.'))
 reader.onload=()=>{
  const src=String(reader.result||'')
  const image=new Image()
  image.onerror=()=>reject(new Error('Gagal memproses gambar.'))
  image.onload=()=>{
   const maxSize=1600
   const scale=Math.min(1,maxSize/Math.max(image.width||1,image.height||1))
   const width=Math.max(1,Math.round((image.width||1)*scale))
   const height=Math.max(1,Math.round((image.height||1)*scale))
   const canvas=document.createElement('canvas')
   canvas.width=width;canvas.height=height
   const ctx=canvas.getContext('2d')
   if(!ctx)return reject(new Error('Browser tidak mendukung pemrosesan gambar.'))
   ctx.drawImage(image,0,0,width,height)
   const compressed=canvas.toDataURL('image/webp',0.82)
   // Keep payload safely below typical serverless request limits.
   if(compressed.length>1800000)return reject(new Error('Ukuran gambar masih terlalu besar. Pilih gambar yang lebih kecil.'))
   resolve(compressed)
  }
  image.src=src
 }
 reader.readAsDataURL(file)
})

export default function AdminMenuPage(){
 const{id}=useParams();const{refresh:refreshCustomer}=useMenu();const[items,setItems]=useState([]);const[editing,setEditing]=useState(null);const[form,setForm]=useState({...initial,variants:[]});const[error,setError]=useState('');const[notice,setNotice]=useState('');const[busy,setBusy]=useState(false)
 const load=async()=>{try{setError('');const d=await getMenuAdmin();setItems(d?.items||[])}catch(e){setError(e.message||'Gagal memuat menu.')}}
 useEffect(()=>{load()},[]);useLiveRefresh(load,['menu_items'],5000)
 useEffect(()=>{if(id&&items.length){const found=items.find(x=>String(x.id)===String(id));if(found&&!editing)edit(found)}},[id,items])
 const set=(k,v)=>setForm(p=>({...p,[k]:v}))
 const reset=()=>{setEditing(null);setForm({...initial,variants:[]});setNotice('')}
 const edit=item=>{setEditing(item);setForm({name:item.name,category:item.category||'Makanan',price:item.price,badge:item.badge||'',description:item.description||'',available:item.available!==false,hasVariant:Boolean(item.hasVariant),variants:item.variants||[],imageFile:null});window.scrollTo({top:0,behavior:'smooth'})}
 const submit=async e=>{e.preventDefault();setBusy(true);setError('');setNotice('');try{const name=form.name.trim();if(!name)throw new Error('Nama menu wajib diisi.');const price=Number(form.price);if(!Number.isFinite(price)||price<=0)throw new Error('Harga harus lebih dari 0.');if(!categories.includes(form.category))throw new Error('Kategori wajib dipilih.');const variants=form.hasVariant?form.variants.map(v=>({label:String(v.label||'').trim(),price:Number(v.price)})).filter(v=>v.label):[];if(form.hasVariant&&(!variants.length||variants.some(v=>!Number.isFinite(v.price)||v.price<0)))throw new Error('Setiap varian harus memiliki nama dan harga valid.');const imageBase64=await image64(form.imageFile);const payload={name,category:form.category,price,badge:form.badge.trim(),description:form.description.trim(),available:form.available,hasVariant:form.hasVariant,variants,imageBase64};if(editing)await updateMenuItem(editing.id,payload);else await createMenuItem(payload);reset();await load();await refreshCustomer();setNotice(editing?'Menu berhasil diperbarui.':'Menu berhasil disimpan.')}catch(e){setError(e.message||'Gagal menyimpan menu.')}finally{setBusy(false)}}
 const remove=async item=>{if(!window.confirm(`Hapus menu "${item.name}" dari website?`))return;setBusy(true);setError('');try{await deleteMenuItem(item.id);await load();await refreshCustomer();setNotice('Menu berhasil dinonaktifkan.')}catch(e){setError(e.message||'Gagal menghapus menu.')}finally{setBusy(false)}}
 return <AdminPageShell title="Menu" subtitle="Satu sumber data untuk menu Admin dan website pembelian.">
  {error?<div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</div>:null}{notice?<div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{notice}</div>:null}
  <div className="admin-menu-layout grid gap-4 xl:grid-cols-[430px_minmax(0,1fr)]">
   <form onSubmit={submit} className="admin-form-card rounded-[30px] border border-white/70 bg-white/65 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:p-5">
    <div className="mb-4 flex items-start justify-between"><div><div className="mb-2 flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"><AdminIcon name={editing?'edit':'plus'} size={17}/></span><h2 className="text-lg font-black text-slate-900 dark:text-white">{editing?'Edit Menu':'Tambah Menu'}</h2></div><p className="text-xs text-slate-400">Perubahan tersimpan langsung ke Supabase.</p></div>{editing?<button type="button" onClick={reset} className="text-xs font-black text-slate-400">Batal</button>:null}</div>
    <div className="space-y-3">
     <label><span className={label}>Gambar Menu</span><input className={input} type="file" accept="image/*" onChange={e=>set('imageFile',e.target.files?.[0]||null)}/></label>
     <label><span className={label}>Nama Menu</span><input className={input} value={form.name} onChange={e=>set('name',e.target.value)} required/></label>
     <fieldset><legend className={label}>Kategori</legend><div className="grid grid-cols-2 gap-2">{categories.map(c=><label key={c} className={`flex items-center gap-2 rounded-2xl border px-3 py-3 text-sm font-bold ${form.category===c?'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-400/40 dark:bg-indigo-500/10 dark:text-indigo-200':'border-slate-200 bg-white/60 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300'}`}><input type="radio" name="category" checked={form.category===c} onChange={()=>set('category',c)}/>{c}</label>)}</div></fieldset>
     <label><span className={label}>Harga</span><input className={`${input} admin-money-input`} type="number" min="1" inputMode="numeric" value={form.price} onChange={e=>set('price',e.target.value)} required/></label>
     <label><span className={label}>Badge</span><input className={input} value={form.badge} onChange={e=>set('badge',e.target.value)} placeholder="Best Seller"/></label>
     <label><span className={label}>Deskripsi</span><textarea className={`${input} resize-y`} rows="3" value={form.description} onChange={e=>set('description',e.target.value)}/></label>
     <label className="admin-check-row flex items-center gap-2 rounded-2xl bg-slate-50/80 px-3 py-2.5 text-sm font-bold text-slate-700 dark:bg-white/5 dark:text-slate-200"><input type="checkbox" checked={form.available} onChange={e=>set('available',e.target.checked)}/> Tersedia / tampil di website</label>
     <label className="admin-check-row flex items-center gap-2 rounded-2xl bg-slate-50/80 px-3 py-2.5 text-sm font-bold text-slate-700 dark:bg-white/5 dark:text-slate-200"><input type="checkbox" checked={form.hasVariant} onChange={e=>set('hasVariant',e.target.checked)}/> Menggunakan Variant</label>
     {form.hasVariant?<div className="admin-variant-box rounded-2xl bg-slate-50/80 p-2.5 dark:bg-white/5"><div className="mb-2 flex items-center justify-between gap-2"><p className="text-xs font-black uppercase tracking-wide text-slate-500">Daftar Variant</p><button type="button" onClick={()=>set('variants',[...form.variants,{label:'',price:0}])} className="admin-add-variant-btn">+ Tambah Variant</button></div><div className="space-y-2">{form.variants.map((v,i)=><div className="admin-variant-row-mobile grid grid-cols-[minmax(0,1fr)_92px_36px] gap-2" key={i}><input className={input} placeholder="Nama variant" value={v.label} onChange={e=>set('variants',form.variants.map((x,j)=>j===i?{...x,label:e.target.value}:x))}/><input className={`${input} admin-money-input`} type="number" min="0" inputMode="numeric" value={v.price} onChange={e=>set('variants',form.variants.map((x,j)=>j===i?{...x,price:Number(e.target.value||0)}:x))}/><button type="button" className="rounded-2xl bg-rose-50 text-rose-600" onClick={()=>set('variants',form.variants.filter((_,j)=>j!==i))}><AdminIcon name="trash" size={15}/></button></div>)}</div></div>:null}
    </div>
    <div className="admin-form-actions-mobile mt-4 grid grid-cols-2 gap-2">
      <button type="button" onClick={reset} className="admin-secondary-btn">Bersihkan</button>
      <button disabled={busy} className="admin-primary-btn">{busy?'Menyimpan...':editing?'Simpan Perubahan':'Save'}</button>
    </div>
   </form>
   <div className="rounded-[30px] border border-white/70 bg-white/65 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:p-6"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-black text-slate-900 dark:text-white">Daftar Menu</h2><p className="text-xs text-slate-400">{items.length} menu dari database</p></div><button type="button" onClick={load} className="rounded-xl bg-slate-100 p-2.5 dark:bg-white/10" aria-label="Refresh"><AdminIcon name="refresh" size={15}/></button></div><div className="admin-horizontal-scroll"><table className="w-full min-w-[720px] text-left text-sm"><thead><tr className="border-b text-[10px] font-black uppercase tracking-wider text-slate-400"><th className="px-3 py-3">Menu</th><th className="px-3 py-3">Kategori</th><th className="px-3 py-3">Harga</th><th className="px-3 py-3">Stok</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Aksi</th></tr></thead><tbody>{items.map(item=><tr key={item.id} className="border-b last:border-0"><td className="px-3 py-3"><div className="flex items-center gap-3"><img src={item.imageUrl} alt="" className="h-10 w-10 rounded-xl object-cover"/><div><p className="font-black">{item.name}</p>{item.hasVariant?<p className="text-[10px] text-indigo-500">{item.variants?.length||0} variant</p>:null}</div></div></td><td className="px-3 py-3">{item.category}</td><td className="px-3 py-3 font-black">{money(item.price)}</td><td className="px-3 py-3 font-black">{item.stock} pcs</td><td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-black ${item.available?'bg-emerald-100 text-emerald-700':'bg-slate-100 text-slate-500'}`}>{item.available?'Aktif':'Nonaktif'}</span></td><td className="px-3 py-3"><div className="flex gap-1"><button type="button" onClick={()=>edit(item)} className="rounded-xl p-2 text-indigo-600"><AdminIcon name="edit" size={16}/></button><button type="button" onClick={()=>remove(item)} className="rounded-xl p-2 text-rose-600"><AdminIcon name="trash" size={16}/></button></div></td></tr>)}{!items.length?<tr><td colSpan="6" className="px-3 py-12 text-center text-sm font-semibold text-slate-400">Belum ada menu.</td></tr>:null}</tbody></table></div></div>
  </div>
 </AdminPageShell>
}
