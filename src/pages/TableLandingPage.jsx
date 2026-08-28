import { apiUrl } from '../lib/apiUrl'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useOrderDraft } from '../context/OrderDraftContext'

export default function TableLandingPage({legacy=false}) {
  const { tableNumber } = useParams()
  const raw=String(tableNumber||'').trim().toUpperCase()
  const tableSlug = legacy ? `M${raw}` : `M${raw}`
  const navigate = useNavigate()
  const { setTable } = useOrderDraft()
  const [error, setError] = useState('')
  useEffect(() => {
    let cancelled=false
    ;(async()=>{
      try{
        const r=await fetch(apiUrl('table-lookup',`name=${encodeURIComponent(tableSlug)}`))
        const d=await r.json().catch(()=>null)
        if(!r.ok) throw new Error(d?.message||'Meja tidak ditemukan.')
        if(cancelled)return
        setTable({id:d.table.id,name:d.table.name,capacity:d.table.capacity,source:'qr'})
        navigate('/',{replace:true})
      }catch(e){if(!cancelled)setError(e.message||'Meja tidak ditemukan.')}
    })()
    return()=>{cancelled=true}
  },[tableSlug,navigate,setTable])
  return <div className="app-shell"><main className="container checkout-only-page"><section className="glass-card" style={{padding:'32px',textAlign:'center'}}><p className="eyebrow">Meja</p><h1>{tableSlug||'Meja'}</h1><p>{error||'Menyiapkan halaman order untuk meja ini...'}</p>{error?<button className="primary-btn" type="button" onClick={()=>navigate('/')}>Kembali ke Menu</button>:null}</section></main></div>
}
