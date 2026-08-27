import { supabase } from '../../supabase.js'
import { requireAdmin } from '../_shared.js'
const num=v=>Number.isFinite(Number(v))?Number(v):0
const paid=s=>['paid','processing','completed'].includes(String(s||'').toLowerCase())
const qty=items=>(items||[]).reduce((a,x)=>a+num(x.qty??x.quantity),0)
export default async function handler(req,res){
 if(req.method!=='GET')return res.status(405).json({message:'Method not allowed'})
 if(!await requireAdmin(req,res))return
 try{
  const [{data:menus,error:me},{data:orders,error:oe}]=await Promise.all([
   supabase.from('menu_items').select('*').eq('available',true),
   supabase.from('orders').select('*').order('created_at',{ascending:false}).limit(1000),
  ])
  if(me)throw me;if(oe)throw oe
  const soldOrders=(orders||[]).filter(o=>paid(o.payment_status||o.status))
  const sold=soldOrders.reduce((a,o)=>a+qty(o.items),0), remaining=(menus||[]).reduce((a,m)=>a+num(m.stock),0), available=remaining+sold
  const revenue=soldOrders.reduce((a,o)=>a+num(o.total),0);const now=new Date();const day=new Date(now.getFullYear(),now.getMonth(),now.getDate()),month=new Date(now.getFullYear(),now.getMonth(),1)
  const today=soldOrders.filter(o=>new Date(o.created_at)>=day).reduce((a,o)=>a+num(o.total),0),monthRevenue=soldOrders.filter(o=>new Date(o.created_at)>=month).reduce((a,o)=>a+num(o.total),0)
  res.status(200).json({stock:{available,sold,remaining,soldPercent:available?Number((sold/available*100).toFixed(1)):0},revenue:{all:revenue,today,month:monthRevenue},transactions:soldOrders.length,latest:(orders||[]).slice(0,8).map(o=>({orderId:o.order_id,customerName:o.customer_name,total:num(o.total),paymentMethod:o.payment_method,paymentStatus:o.payment_status||o.status,createdAt:o.created_at,items:o.items||[]}))})
 }catch(e){console.error('[ADMIN DASHBOARD]',e);res.status(500).json({message:e.message})}
}
