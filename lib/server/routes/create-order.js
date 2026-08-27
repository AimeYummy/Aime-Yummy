import { supabase } from '../../lib/supabase.js'
import { attachTelegramMessageId, createOrderRecord, releaseOrderStock, reserveOrderStock } from '../../lib/server/_store.js'
import { buildOwnerMessage, ensureTelegramWebhook, formatOrderTime, getMethodLabel, getOrderItemsCount, getStatusLabel } from '../../lib/server/_shared.js'

async function sendTelegramMessage(order) {
  const botToken=process.env.TELEGRAM_BOT_TOKEN, chatId=process.env.TELEGRAM_CHAT_ID
  if(!botToken||!chatId)return null
  const payload={chat_id:chatId,text:buildOwnerMessage(order),reply_markup:{inline_keyboard:[[{text:'✅ Konfirmasi Pembayaran',callback_data:`confirm_payment:${order.orderId}`}]]}}
  const response=await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
  const data=await response.json().catch(()=>null)
  if(!response.ok||!data?.ok)throw new Error(data?.description||'Failed to send Telegram notification')
  return data.result||null
}
function buildResponse(order,telegramMessageId=null){return{...order,paymentStatus:order.paymentStatus||'pending',status:order.paymentStatus||'pending',statusLabel:getStatusLabel(order.paymentStatus),methodLabel:getMethodLabel(order.paymentMethod),timeLabel:formatOrderTime(order.createdAt),itemCount:getOrderItemsCount(order.items||[]),telegramMessageId:telegramMessageId||order.telegramMessageId||null}}

export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({message:'Method not allowed'})
  try{
    const body=req.body||{}, rawItems=Array.isArray(body.items)?body.items:[]
    if(!rawItems.length)return res.status(400).json({message:'Minimal satu item untuk pesanan.'})
    const ids=[...new Set(rawItems.map(x=>String(x.id||'').trim()).filter(Boolean))]
    const {data:menus,error:me}=await supabase.from('menu_items').select('id,name,category,price,stock,pcs_per_mika,available,has_variant,variants').in('id',ids)
    if(me)throw me
    const byId=new Map((menus||[]).map(m=>[String(m.id),m]))
    const enriched=[]
    for(const raw of rawItems){
      const menu=byId.get(String(raw.id||'')); if(!menu)throw new Error('Salah satu menu sudah tidak tersedia.')
      const qty=Math.max(1,Math.floor(Number(raw.qty ?? raw.quantity ?? 0))); if(!Number.isFinite(qty)||qty<1)throw new Error(`Jumlah ${menu.name} tidak valid.`)
      if(menu.available===false||Number(menu.stock||0)<qty)throw new Error(`Stok ${menu.name} tidak mencukupi.`)
      const allowed=Array.isArray(menu.variants)?menu.variants:[]
      const requestedLabel=String(raw.variantLabel||'').trim()
      const variant=allowed.find(v=>String(v?.label||v?.name||'').trim()===requestedLabel)
      const variantPrice=Number(variant?.price??raw.variantPrice??0)
      enriched.push({id:menu.id,name:menu.name,category:menu.category,qty,price:Number(menu.price||0)+variantPrice,basePrice:Number(menu.price||0),variant:variant?String(raw.variant||requestedLabel):'',variantLabel:variant?requestedLabel:''})
    }
    const subtotal=enriched.reduce((sum,item)=>sum+item.price*item.qty,0)
    const orderId=crypto.randomUUID()
    let table=null
    if(body.tableId){const {data,error}=await supabase.from('tables').select('id,name,is_active').eq('id',body.tableId).eq('is_active',true).maybeSingle();if(error)throw error;if(!data)throw new Error('Meja sudah tidak aktif.');table=data}
    const order={orderId,customerName:String(body.customerName||body.name||'Pelanggan').trim()||'Pelanggan',customerPhone:String(body.customerPhone||body.phone||'-').trim(),customerEmail:String(body.customerEmail||body.email||'-').trim(),note:String(body.note||'').trim(),items:enriched,itemCount:getOrderItemsCount(enriched),subtotal,total:subtotal,paymentMethod:String(body.paymentMethod||body.method||'QRIS').toUpperCase()==='CASH'?'CASH':'QRIS',paymentStatus:'pending',stockDeducted:true,tableId:table?.id||null,tableName:table?.name||''}
    await reserveOrderStock(order)
    try{await createOrderRecord(order)}catch(e){await releaseOrderStock(order).catch(()=>{});throw e}
    let telegramMessage=null
    try{await ensureTelegramWebhook(req);telegramMessage=await sendTelegramMessage(order);if(telegramMessage?.message_id)await attachTelegramMessageId(orderId,telegramMessage.message_id)}catch(error){console.error('[CREATE ORDER] Telegram send failed',{orderId,message:error.message})}
    const saved={...order,telegramMessageId:telegramMessage?.message_id||null}
    return res.status(200).json(buildResponse(saved,saved.telegramMessageId))
  }catch(error){console.error('[CREATE ORDER] FAILED',{message:error.message});return res.status(500).json({message:error.message||'Failed to create order'})}
}
