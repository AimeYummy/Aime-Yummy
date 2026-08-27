import { supabase } from '../../supabase.js'
import { requireAdmin } from '../_shared.js'

async function nextTableName(){
  const {data,error}=await supabase.from('tables').select('name').like('name','mejaa____').order('name',{ascending:false}).limit(1000);if(error)throw error
  const used=new Set((data||[]).map(x=>String(x.name||'').toLowerCase()))
  for(let i=1;i<=9999;i++){const name=`mejaa${String(i).padStart(4,'0')}`;if(!used.has(name))return name}
  throw new Error('Nomor meja sudah mencapai batas 9999.')
}
export default async function handler(req,res){if(!await requireAdmin(req,res))return;try{
 if(req.method==='GET'){const [{data:tables,error:te},{data:orders,error:oe}]=await Promise.all([supabase.from('tables').select('*').eq('is_active',true).order('name'),supabase.from('orders').select('order_id,table_id,total,items,payment_status,status')]);if(te)throw te;if(oe)throw oe;const done=(orders||[]).filter(o=>['paid','processing','completed'].includes(o.payment_status||o.status));const report=(tables||[]).map(t=>{const os=done.filter(o=>o.table_id===t.id);const units=os.reduce((a,o)=>a+(o.items||[]).reduce((b,x)=>b+(Number(x.qty??x.quantity)||0),0),0);const revenue=os.reduce((a,o)=>a+(Number(o.total)||0),0);return{tableId:t.id,tableName:t.name,transactions:os.length,units,revenue,average:os.length?revenue/os.length:0}});return res.status(200).json({tables,report})}
 if(req.method==='POST'){const b=req.body||{};const name=await nextTableName();const payload={name,capacity:Math.max(1,Number(b.capacity)||4),status:'Kosong',is_active:true,updated_at:new Date().toISOString()};const{data,error}=await supabase.from('tables').insert(payload).select('*').single();if(error)throw error;return res.status(200).json({table:data})}
 if(req.method==='PATCH'){const b=req.body||{};if(!b.id)return res.status(400).json({message:'id wajib diisi'});const payload={capacity:Math.max(1,Number(b.capacity)||4),status:['Kosong','Terisi','Dipesan'].includes(b.status)?b.status:'Kosong',updated_at:new Date().toISOString()};const{data,error}=await supabase.from('tables').update(payload).eq('id',b.id).select('*').single();if(error)throw error;return res.status(200).json({table:data})}
 if(req.method==='DELETE'){if(!req.query.id)return res.status(400).json({message:'id wajib'});const{error}=await supabase.from('tables').update({is_active:false,status:'Kosong',updated_at:new Date().toISOString()}).eq('id',req.query.id);if(error)throw error;return res.status(200).json({ok:true})}
 return res.status(405).json({message:'Method not allowed'})
}catch(e){console.error('[ADMIN TABLES]',e);res.status(500).json({message:e.message||'Gagal memproses meja'})}}
