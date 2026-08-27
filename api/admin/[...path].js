import dashboard from '../../lib/server/admin/dashboard.js'
import menu from '../../lib/server/admin/menu.js'
import orders from '../../lib/server/admin/orders.js'
import tables from '../../lib/server/admin/tables.js'
import sales from '../../lib/server/admin/sales.js'

const handlers = { dashboard, menu, orders, tables, sales }

export default async function handler(req, res) {
  const raw = req.query?.path
  const parts = Array.isArray(raw) ? raw : String(raw || '').split('/').filter(Boolean)
  const resource = parts[0]
  const target = handlers[resource]

  if (!target) return res.status(404).json({ message: 'Admin endpoint not found' })
  return target(req, res)
}
