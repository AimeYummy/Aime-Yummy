import { getOrder, releaseOrderStock, updateOrder } from '../_store.js'
import { getMethodLabel, getStatusLabel, formatOrderTime } from '../_shared.js'

export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({message:'Method not allowed'})
  const orderId=String(req.query.orderId||'').trim();if(!orderId)return res.status(400).json({message:'orderId is required'})
  try{
    const order=await getOrder(orderId);if(!order)return res.status(404).json({message:'Order not found'})
    const status=String(order.paymentStatus||order.status||'pending').toLowerCase()
    if(status==='failed')return res.status(200).json(order)
    if(['paid','processing','completed'].includes(status))return res.status(409).json({message:'Order sudah diproses dan tidak dapat ditandai gagal.'})
    if(order.stockDeducted)await releaseOrderStock(order)
    const updated=await updateOrder(orderId,{paymentStatus:'failed',stockDeducted:false})
    return res.status(200).json({...updated,paymentStatus:updated.paymentStatus,status:updated.paymentStatus,statusLabel:getStatusLabel(updated.paymentStatus),methodLabel:getMethodLabel(updated.paymentMethod),timeLabel:formatOrderTime(updated.createdAt)})
  }catch(e){console.error('[FAIL ORDER]',{orderId,message:e.message});return res.status(500).json({message:e.message||'Failed to release order stock'})}
}
