import { supabase } from '../../lib/supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' })
  try {
    const name = String(req.query?.name || '').trim().toLowerCase()
    if (!/^mejaa\d{4}$/.test(name)) return res.status(400).json({ message: 'Kode meja tidak valid' })
    const { data, error } = await supabase.from('tables').select('id,name,status,capacity,is_active').eq('name', name).eq('is_active', true).maybeSingle()
    if (error) throw error
    if (!data) return res.status(404).json({ message: 'Meja tidak ditemukan atau sudah tidak aktif.' })
    return res.status(200).json({ table: data })
  } catch (e) {
    return res.status(500).json({ message: e.message || 'Gagal memuat meja.' })
  }
}
