import { supabaseBrowser } from './supabaseClient'
import { apiUrl } from './apiUrl'

async function request(path, opt = {}) {
  if (!supabaseBrowser) throw new Error('Supabase belum dikonfigurasi. Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY tersedia.')
  const { data, error: sessionError } = await supabaseBrowser.auth.getSession()
  if (sessionError) throw new Error(sessionError.message || 'Gagal membaca sesi admin.')
  const token = data?.session?.access_token
  if (!token) throw new Error('Sesi admin tidak ditemukan. Silakan login kembali.')

  const response = await fetch(apiUrl(path), {
    ...opt,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(opt.headers || {}),
    },
  })
  const raw = await response.text()
  let payload = null
  try { payload = raw ? JSON.parse(raw) : null } catch { payload = null }

  if (!response.ok) {
    const detail = payload?.message ? `: ${payload.message}` : ''
    throw new Error(`Request gagal (${response.status})${detail}`)
  }
  if (!payload || typeof payload !== 'object') {
    throw new Error('Server mengembalikan respons yang tidak valid. Endpoint API tidak merespons JSON.')
  }
  return payload
}

export const getDashboard = () => request('admin/dashboard')
export const getMenuAdmin = () => request('admin/menu')
export const getStockReport = () => request('admin/stock')
export const saveStock = p => request('admin/stock', { method: 'POST', body: JSON.stringify(p) })
export const deleteStockMovement = id => request(`admin/stock?${new URLSearchParams({ id: String(id) })}`, { method: 'DELETE' })
export const getTables = () => request('admin/tables')
export const saveTable = p => request('admin/tables', { method: p.id ? 'PATCH' : 'POST', body: JSON.stringify(p) })
export const deleteTable = id => request(`admin/tables?${new URLSearchParams({ id: String(id) })}`, { method: 'DELETE' })
export const getSales = q => request(`admin/sales${q || ''}`)
export const updateOrderStatus = p => request('admin/orders', { method: 'PATCH', body: JSON.stringify(p) })
export const createManualSale = p => request('admin/orders', { method: 'POST', body: JSON.stringify(p) })
