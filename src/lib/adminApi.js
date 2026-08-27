import {supabaseBrowser} from './supabaseClient'

async function request(url,opt={}){
  if(!supabaseBrowser) throw new Error('Supabase belum dikonfigurasi. Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY tersedia.')
  const {data,error:sessionError}=await supabaseBrowser.auth.getSession()
  if(sessionError) throw new Error(sessionError.message||'Gagal membaca sesi admin.')
  const token=data?.session?.access_token
  if(!token) throw new Error('Sesi admin tidak ditemukan. Silakan login kembali.')
  const response=await fetch(url,{...opt,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{}) ,...(opt.headers||{})}})
  const raw=await response.text()
  let payload=null
  try{payload=raw?JSON.parse(raw):null}catch{payload=null}
  if(!response.ok) throw new Error(payload?.message||`Request gagal (${response.status})`)
  if(!payload||typeof payload!=='object') throw new Error('Server mengembalikan respons yang tidak valid. Periksa routing API Vercel.')
  return payload
}
export const getDashboard=()=>request('/api/admin/dashboard')
export const getMenuAdmin=()=>request('/api/admin/menu')
export const getStockReport=()=>request('/api/admin/stock')
export const saveStock=p=>request('/api/admin/stock',{method:'POST',body:JSON.stringify(p)})
export const getTables=()=>request('/api/admin/tables')
export const saveTable=p=>request('/api/admin/tables',{method:p.id?'PATCH':'POST',body:JSON.stringify(p)})
export const deleteTable=id=>request(`/api/admin/tables?id=${encodeURIComponent(id)}`,{method:'DELETE'})
export const getSales=q=>request(`/api/admin/sales${q||''}`)
export const updateOrderStatus=p=>request('/api/admin/orders',{method:'PATCH',body:JSON.stringify(p)})
export const createManualSale=p=>request('/api/admin/orders',{method:'POST',body:JSON.stringify(p)})
