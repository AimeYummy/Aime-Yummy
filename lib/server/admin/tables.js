import { supabase } from '../../supabase.js'
import { requireAdmin } from '../_shared.js'

async function nextTableName(){
  const {data,error}=await supabase.from('tables').select('name').order('name',{ascending:true}).limit(10000);if(error)throw error
  const used=new Set((data||[]).map(x=>String(x.name||'').toUpperCase()))
  for(let i=1;i<=9999;i++){const name=`M${String(i).padStart(4,'0')}`;if(!used.has(name))return name}
  throw new Error('Nomor meja sudah mencapai batas 9999.')
}

export default async function handler(req,res){
  if(!await requireAdmin(req,res))return
  try{
    if(req.method==='GET'){
      const {data:tables,error:te}=await supabase.from('tables').select('*').eq('is_active',true).order('name');if(te)throw te
      return res.status(200).json({tables:tables||[],report:[]})
    }
    if(req.method==='POST'){
      const b=req.body||{}, name=await nextTableName()
      const payload={name,capacity:Math.max(1,Number(b.capacity)||4),status:'Kosong',is_active:true,updated_at:new Date().toISOString()}
      const {data,error}=await supabase.from('tables').insert(payload).select('*').single();if(error)throw error
      return res.status(200).json({table:data})
    }
    if(req.method==='PATCH'){
      const b=req.body||{};if(!b.id)return res.status(400).json({message:'id wajib diisi'})
      const payload={capacity:Math.max(1,Number(b.capacity)||4),status:['Kosong','Terisi','Dipesan'].includes(b.status)?b.status:'Kosong',updated_at:new Date().toISOString()}
      const {data,error}=await supabase.from('tables').update(payload).eq('id',b.id).select('*').single();if(error)throw error
      return res.status(200).json({table:data})
    }
    if(req.method==='DELETE'){
      const id=String(req.query?.id||'').trim();if(!id)return res.status(400).json({message:'id wajib'})
      const {error}=await supabase.from('tables').delete().eq('id',id);if(error)throw error
      return res.status(200).json({ok:true,id})
    }
    return res.status(405).json({message:'Method not allowed'})
  }catch(e){console.error('[ADMIN TABLES]',e);return res.status(500).json({message:e.message||'Gagal memproses meja'})}
}
