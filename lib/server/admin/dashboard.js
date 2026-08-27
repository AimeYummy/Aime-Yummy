import { supabase } from '../../supabase.js'
import { requireAdmin } from '../_shared.js'
const n=v=>Number.isFinite(Number(v))?Number(v):0
const active=s=>!['failed','cancelled'].includes(String(s||'').toLowerCase())
const qty=items=>(items||[]).reduce((a,x)=>a+n(x.qty??x.quantity),0)
export default async function handler(req,res){if(req.method!=='GET')return res.status(405).json({message:'Method not allowed'});if(!await requireAdmin(req,res))return;try{
  const [{data:menus,error:me},{data:orders,error:oe}]=await Promise.all([
    supabase.from('menu_items').select('id,name,stock').order('name'),
    supabase.from('orders').select('order_id,customer_name,total,payment_method,payment_status,status,created_at,items,stock_deducted,table_id').order('created_at',{ascending:false}).limit(2000),
  ]);if(me)throw me;if(oe)throw oe
  const all=(orders||[]).filter(active), revenueOrders=all.filter(o=>['paid','processing','completed'].includes(String(o.payment_status||o.status||'').toLowerCase()))
  const sold=all.filter(o=>Boolean(o.stock_deducted)).reduce((a,o)=>a+qty(o.items),0)
  const remaining=(menus||[]).reduce((a,m)=>a+n(m.stock),0)
  const historicalStock=(menus||[]).reduce((a,m)=>a+n(m.stock),0)+sold
  const revenue=revenueOrders.reduce((a,o)=>a+n(o.total),0)
  const now=new Date(), day=new Date(now.getFullYear(),now.getMonth(),now.getDate()), month=new Date(now.getFullYear(),now.getMonth(),1)
  const todayOrders=all.filter(o=>new Date(o.created_at)>=day)
  const today=revenueOrders.filter(o=>new Date(o.created_at)>=day).reduce((a,o)=>a+n(o.total),0)
  const monthRevenue=revenueOrders.filter(o=>new Date(o.created_at)>=month).reduce((a,o)=>a+n(o.total),0)
  const latest=all.slice(0,10).map(o=>({orderId:o.order_id,customerName:o.customer_name,total:n(o.total),paymentMethod:o.payment_method,paymentStatus:o.payment_status||o.status,createdAt:o.created_at,items:o.items||[],tableId:o.table_id||null}))
  res.status(200).json({stock:{available:historicalStock,sold,remaining,soldPercent:historicalStock?Number((sold/historicalStock*100).toFixed(1)):0},revenue:{all:revenue,today,month:monthRevenue},transactions:all.length,transactionsToday:todayOrders.length,latest})
}catch(e){console.error('[ADMIN DASHBOARD]',e);res.status(500).json({message:e.message||'Gagal memuat dashboard'})}}
