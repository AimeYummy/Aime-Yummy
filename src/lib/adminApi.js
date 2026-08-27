import {supabaseBrowser} from './supabaseClient'
async function request(url,opt={}){const{data}=await supabaseBrowser?.auth.getSession();const token=data?.session?.access_token;const r=await fetch(url,{...opt,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{}) ,...(opt.headers||{})}});const d=await r.json().catch(()=>null);if(!r.ok)throw new Error(d?.message||'Permintaan gagal');return d}
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
