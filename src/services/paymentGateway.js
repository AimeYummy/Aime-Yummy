import { apiUrl } from '../lib/apiUrl'
export async function createQris(payload) {
  const response = await fetch(apiUrl('create-qris'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Gagal membuat QRIS')
  }

  if (data.status !== 'success') {
    throw new Error(data.message || 'Gagal generate QRIS')
  }

  return data
}

export const createQRIS = createQris

export async function createOrder(payload) {
  const response = await fetch(apiUrl('create-order'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Gagal membuat order')
  }

  return data
}

export async function getOrderStatus(orderId) {
  const response = await fetch(apiUrl(`orders/${encodeURIComponent(orderId)}/status`))
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Gagal mengambil status order')
  }

  return data
}

export async function checkPayment(orderId) {
  const response = await fetch(apiUrl('check-payment', `orderId=${encodeURIComponent(orderId)}`))
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Gagal mengecek pembayaran')
  }

  return data
}

