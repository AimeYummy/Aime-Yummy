import { listMenuItems } from '../_menu-store.js'
import { requireAdmin } from '../_shared.js'
export default async function handler(req,res){
  if(req.method!=='GET')return res.status(405).json({message:'Method not allowed'})
  if(!await requireAdmin(req,res))return
  try{ return res.status(200).json({items:await listMenuItems(false)}) }
  catch(e){ return res.status(500).json({message:e.message}) }
}
