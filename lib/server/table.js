import { supabase } from '../supabase.js'

export async function getTableByName(name) {
  const normalized = String(name || '').trim().toLowerCase()
  const { data, error } = await supabase.from('tables').select('id,name,status,capacity,is_active').eq('name', normalized).eq('is_active', true).maybeSingle()
  if (error) throw error
  return data || null
}
