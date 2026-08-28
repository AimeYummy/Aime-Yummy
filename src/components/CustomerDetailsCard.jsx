import React,{useEffect,useState} from 'react'
import { motion } from 'framer-motion'
import { apiUrl } from '../lib/apiUrl'
import { useOrderDraft } from '../context/OrderDraftContext'

export default function CustomerDetailsCard({ hideNote = false, title = 'Customer information', copy = 'Data ini akan ikut terkirim ke backend dan ke pesan admin untuk konfirmasi pesanan.' }) {
  const { customer, setCustomer, table, setTable } = useOrderDraft()
  const [tables,setTables]=useState([])
  const [loadingTables,setLoadingTables]=useState(false)
  const [tableError,setTableError]=useState('')

  useEffect(()=>{
    if(table?.source==='qr') return
    let cancelled=false
    setLoadingTables(true);setTableError('')
    fetch(apiUrl('table-lookup','available=1')).then(async r=>{const d=await r.json().catch(()=>null);if(!r.ok)throw new Error(d?.message||'Gagal memuat pilihan meja.');return d}).then(d=>{if(!cancelled)setTables(d?.tables||[])}).catch(e=>{if(!cancelled)setTableError(e.message||'Gagal memuat meja.')}).finally(()=>{if(!cancelled)setLoadingTables(false)})
    return()=>{cancelled=true}
  },[table?.source])

  const selectedValue=table?.id||''
  const chooseTable=e=>{
    const id=e.target.value
    if(!id){setTable(null);return}
    const found=tables.find(t=>String(t.id)===String(id))
    if(found)setTable({id:found.id,name:found.name,capacity:found.capacity,source:'manual'})
  }

  return <motion.section className="customer-card glass-card" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.45 }}>
    <div className="section-head compact"><div><p className="eyebrow">Customer information</p><h2>{title}</h2><p className="section-copy">{copy}</p></div></div>
    <div className="field-grid customer-grid">
      <label className="field"><span>Nama</span><input value={customer.name} onChange={event=>setCustomer(prev=>({...prev,name:event.target.value}))} placeholder="Nama pelanggan"/></label>
      <label className="field"><span>Nomor WhatsApp</span><input value={customer.phone} onChange={event=>setCustomer(prev=>({...prev,phone:event.target.value}))} placeholder="08xxxxxxxxxx"/></label>
      <label className="field field-full"><span>Email</span><input type="email" value={customer.email} onChange={event=>setCustomer(prev=>({...prev,email:event.target.value}))} placeholder="nama@email.com"/></label>
      <div className="field field-full">
        <span>Nomor meja</span>
        {table?.source==='qr' ? (
          <div className="table-selection-lock" role="status"><strong>Nomor meja : {table.name}</strong><small>Meja ditetapkan dari QR meja dan tidak dapat diubah.</small></div>
        ) : (
          <select value={selectedValue} onChange={chooseTable} disabled={loadingTables}>
            <option value="">None — tanpa meja</option>
            {tables.map(t=><option key={t.id} value={t.id}>{t.name} — Kosong</option>)}
          </select>
        )}
        {tableError?<small className="field-error-text">{tableError}</small>:null}
      </div>
      {hideNote?null:<label className="field field-full"><span>Add another notes</span><textarea value={customer.note} onChange={event=>setCustomer(prev=>({...prev,note:event.target.value}))} placeholder="Tambah catatan tambahan untuk admin" rows={3}/></label>}
    </div>
  </motion.section>
}
