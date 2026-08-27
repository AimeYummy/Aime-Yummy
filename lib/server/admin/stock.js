import { supabase } from '../../supabase.js'
import { requireAdmin } from '../_shared.js'
const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d
export default async function handler(req,res){if(!await requireAdmin(req,res))return;try{
 if(req.method==='GET'){
  const [{data:menus,error:me},{data:moves,error:se}]=await Promise.all([supabase.from('menu_items').select('*').order('name'),supabase.from('stock_movements').select('*').order('created_at',{ascending:false}).limit(2000)]);if(me)throw me;if(se)throw se
  const items=(menus||[]).map(m=>{const r=(moves||[]).filter(x=>x.menu_id===m.id);return{id:m.id,name:m.name,stock:num(m.stock),pcsPerMika:num(m.pcs_per_mika,1),in:r.filter(x=>x.type==='IN').reduce((a,x)=>a+num(x.quantity_pcs),0),out:r.filter(x=>x.type==='OUT').reduce((a,x)=>a+num(x.quantity_pcs),0)}});return res.status(200).json({items,history:moves||[]})
 }
 if(req.method==='POST'){
  const b=req.body||{};const direct=Math.floor(num(b.quantityPcs));const qm=Math.floor(num(b.quantityMika));const ppm=Math.floor(num(b.pcsPerMika,1));const add=direct>0?direct:qm*ppm
  if(!b.menuId||add<=0)return res.status(400).json({message:'Produk dan jumlah pcs tambahan wajib valid.'})
  const{data:m,error:re}=await supabase.from('menu_items').select('*').eq('id',b.menuId).single();if(re)throw re
  const next=num(m.stock)+add;const effectivePpm=Math.max(1,Math.floor(num(m.pcs_per_mika,1)))
  const{data:item,error:ue}=await supabase.from('menu_items').update({stock:next,pcs_per_mika:effectivePpm,in_stock:true,available:true,updated_at:new Date().toISOString()}).eq('id',b.menuId).select('*').single();if(ue)throw ue
  const{error:ie}=await supabase.from('stock_movements').insert({menu_id:b.menuId,type:'IN',quantity_mika:qm>0?qm:0,pcs_per_mika:effectivePpm,quantity_pcs:add,reference_type:'manual',description:b.description||null,user_id:req.adminUser.id});if(ie)throw ie
  return res.status(200).json({item})
 }
 return res.status(405).json({message:'Method not allowed'})
}catch(e){console.error('[ADMIN STOCK]',e);res.status(500).json({message:e.message})}}
