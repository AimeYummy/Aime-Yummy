import admin from '../lib/server/admin/dashboard.js'
import adminMenu from '../lib/server/admin/menu.js'
import adminOrders from '../lib/server/admin/orders.js'
import adminTables from '../lib/server/admin/tables.js'
import adminSales from '../lib/server/admin/sales.js'
import adminStock from '../lib/server/admin/stock.js'
import checkPayment from '../lib/server/routes/check-payment.js'
import createOrder from '../lib/server/routes/create-order.js'
import createQris from '../lib/server/routes/create-qris.js'
import menuCreate from '../lib/server/routes/menu-create.js'
import menuDelete from '../lib/server/routes/menu-delete.js'
import menuList from '../lib/server/routes/menu-list.js'
import menuUpdate from '../lib/server/routes/menu-update.js'
import tableLookup from '../lib/server/routes/table-lookup.js'
import telegramWebhook from '../lib/server/routes/telegram-webhook.js'
import orderConfirm from '../lib/server/routes/order-confirm.js'
import orderFail from '../lib/server/routes/order-fail.js'
import orderStatus from '../lib/server/routes/order-status.js'

const routes = {
  'check-payment': checkPayment,
  'create-order': createOrder,
  'create-qris': createQris,
  'menu-create': menuCreate,
  'menu-delete': menuDelete,
  'menu-list': menuList,
  'menu-update': menuUpdate,
  'table-lookup': tableLookup,
  'telegram-webhook': telegramWebhook,
}

const adminRoutes = {
  dashboard: admin,
  menu: adminMenu,
  orders: adminOrders,
  tables: adminTables,
  sales: adminSales,
  stock: adminStock,
}

function decodeParts(value) {
  if (Array.isArray(value)) return value
  if (value == null) return []
  return String(value).split('/').filter(Boolean)
}

function getParts(req) {
  // The Vercel rewrite `/api/:path* -> /api/index` passes the captured path
  // as the `path` query parameter. This is intentionally the primary source
  // so the API no longer depends on dynamic filesystem catch-all routing.
  const fromQuery = decodeParts(req.query?.path)
  if (fromQuery.length) return fromQuery.map((part) => decodeURIComponent(part))

  // Keep a defensive fallback for direct calls to /api/index.
  const pathname = String(req.url || '').split('?')[0]
  const match = pathname.match(/^\/api\/index(?:\/|$)/)
  if (match) return []

  const direct = pathname.replace(/^\/api(?:\/|$)/, '')
  return direct.split('/').filter(Boolean).map((part) => decodeURIComponent(part))
}

function notFound(res, message = 'API endpoint not found') {
  return res.status(404).json({ message })
}

export default async function handler(req, res) {
  res.setHeader?.('Content-Type', 'application/json; charset=utf-8')

  try {
    const parts = getParts(req)
    const first = parts[0]

    if (first === 'admin') {
      const resource = parts[1]
      const target = adminRoutes[resource]
      if (!target) return notFound(res, 'Admin endpoint not found')
      return await target(req, res)
    }

    if (first === 'orders') {
      const orderId = parts[1]
      const action = parts[2]
      req.query = { ...(req.query || {}), orderId }
      if (action === 'confirm') return await orderConfirm(req, res)
      if (action === 'fail') return await orderFail(req, res)
      if (action === 'status') return await orderStatus(req, res)
      return notFound(res, 'Order endpoint not found')
    }

    const target = routes[first]
    if (!target) return notFound(res)
    return await target(req, res)
  } catch (error) {
    console.error('[API ROUTER] FAILED', error)
    if (res.headersSent) return
    return res.status(500).json({ message: error?.message || 'Internal API error' })
  }
}
