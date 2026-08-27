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

function getParts(req) {
  const fromQuery = req.query?.path
  if (Array.isArray(fromQuery) && fromQuery.length) {
    return fromQuery.map(String).filter(Boolean)
  }
  if (typeof fromQuery === 'string' && fromQuery.trim()) {
    return fromQuery.split('/').filter(Boolean)
  }
  const pathname = String(req.url || '').split('?')[0]
  return pathname
    .replace(/^\/api\/?/, '')
    .split('/')
    .map((part) => {
      try { return decodeURIComponent(part) } catch { return part }
    })
    .filter(Boolean)
}

function jsonError(res, status, message) {
  return res.status(status).json({ message: String(message || 'Internal server error') })
}

export default async function handler(req, res) {
  try {
    const parts = getParts(req)
    const first = parts[0]

    if (!first) {
      return res.status(200).json({ ok: true, service: 'StoreFlow API', version: '2.0.0' })
    }

    if (first === 'admin') {
      const resource = parts[1]
      const target = adminRoutes[resource]
      if (!target) return jsonError(res, 404, 'Admin endpoint not found')
      return await target(req, res)
    }

    if (first === 'orders') {
      const orderId = parts[1]
      const action = parts[2]
      req.query = { ...(req.query || {}), orderId }
      if (action === 'confirm') return await orderConfirm(req, res)
      if (action === 'fail') return await orderFail(req, res)
      if (action === 'status') return await orderStatus(req, res)
      return jsonError(res, 404, 'Order endpoint not found')
    }

    const target = routes[first]
    if (!target) return jsonError(res, 404, 'API endpoint not found')
    return await target(req, res)
  } catch (error) {
    console.error('[API ROUTER] UNHANDLED ERROR', error)
    if (res.headersSent) return
    return jsonError(res, 500, error?.message || 'Internal server error')
  }
}
