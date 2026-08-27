import React, { useEffect, useState } from 'react'
import AdminPageShell from './AdminPageShell'
import AdminIcon from '../../components/AdminIcon'
import { getDashboard } from '../../lib/adminApi'
import { useLiveRefresh } from '../../lib/liveRefresh'

const rupiah = n => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(n || 0))
const fmt = v => v ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(v)) : '-'

const cards = [
  ['Stok Tersedia', v => `${v?.stock?.available ?? 0} pcs`, 'package', 'indigo'],
  ['Produk Terjual', v => `${v?.stock?.sold ?? 0} pcs`, 'sales', 'emerald'],
  ['Sisa Stok', v => `${v?.stock?.remaining ?? 0} pcs`, 'stock', 'amber'],
  ['Total Uang Masuk', v => rupiah(v?.revenue?.all), 'performance', 'violet'],
  ['Hari Ini', v => rupiah(v?.revenue?.today), 'sales', 'cyan'],
  ['Bulan Ini', v => rupiah(v?.revenue?.month), 'performance', 'blue'],
  ['Persentase Terjual', v => `${v?.stock?.soldPercent ?? 0}%`, 'performance', 'rose'],
  ['Total Transaksi', v => v?.transactions ?? 0, 'menu', 'slate'],
  ['Transaksi Hari Ini', v => v?.transactionsToday ?? 0, 'sales', 'indigo'],
]
const tint = { indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300', emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300', amber: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300', violet: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300', cyan: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-300', blue: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300', rose: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300', slate: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300' }

export default function AdminHomePage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const load = async () => {
    try { setError(''); setLoading(true); setData(await getDashboard()) }
    catch (e) { setError(e?.message || 'Gagal memuat dashboard.') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  useLiveRefresh(load, ['orders','menu_items','stock_movements'], 5000)

  return <AdminPageShell title="Dashboard" subtitle="Pantau stok, pendapatan, transaksi, dan aktivitas terbaru dalam satu tempat.">
    {error ? <div className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-400/15 dark:bg-rose-500/10 dark:text-rose-300"><AdminIcon name="alert" size={18} className="mt-0.5 shrink-0"/><span>{error}</span></div> : null}

    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-9">
      {cards.map(([label, value, icon, color]) => <div key={label} className="rounded-[26px] border border-white/70 bg-white/65 p-4 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 dark:border-white/10 dark:bg-white/5">
        <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl ${tint[color]}`}><AdminIcon name={icon === 'package' ? 'stock' : icon} size={18}/></div>
        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">{label}</p>
        <p className="mt-2 break-words text-base font-black tracking-tight text-slate-900 dark:text-white sm:text-lg">{value(data)}</p>
      </div>)}
    </div>

    <div className="rounded-[30px] border border-white/70 bg-white/65 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"><AdminIcon name="sales" size={18}/></div><div><h2 className="text-lg font-black text-slate-900 dark:text-white">Orderan Masuk</h2><p className="text-xs font-medium text-slate-400">Transaksi terbaru dari website dan kasir.</p></div></div></div>
        <button type="button" onClick={load} disabled={loading} className="flex items-center justify-center gap-2 rounded-2xl border border-white/70 bg-white/75 px-4 py-2.5 text-xs font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:text-indigo-600 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"><AdminIcon name="refresh" size={15} className={loading ? 'animate-spin' : ''}/> Refresh</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b border-slate-200/70 text-[10px] font-black uppercase tracking-[0.13em] text-slate-400 dark:border-white/10 dark:text-slate-500"><th className="px-3 py-3">Order</th><th className="px-3 py-3">Pelanggan</th><th className="px-3 py-3">Total</th><th className="px-3 py-3">Pembayaran</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Waktu</th></tr></thead>
          <tbody>{(data?.latest || []).map(o => <tr key={o.orderId} className="border-b border-slate-200/60 last:border-0 dark:border-white/5"><td className="px-3 py-3 font-black text-slate-800 dark:text-slate-200">{o.orderId}</td><td className="px-3 py-3 text-slate-600 dark:text-slate-300">{o.customerName || 'Umum'}</td><td className="px-3 py-3 font-black text-slate-900 dark:text-white">{rupiah(o.total)}</td><td className="px-3 py-3 text-slate-600 dark:text-slate-300">{o.paymentMethod}</td><td className="px-3 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black capitalize ${o.paymentStatus === 'paid' || o.paymentStatus === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : o.paymentStatus === 'processing' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'}`}>{o.paymentStatus}</span></td><td className="px-3 py-3 text-slate-500 dark:text-slate-400">{fmt(o.createdAt)}</td></tr>)}
            {!data?.latest?.length ? <tr><td colSpan="6" className="px-3 py-12 text-center text-sm font-semibold text-slate-400">Belum ada transaksi.</td></tr> : null}</tbody>
        </table>
      </div>
    </div>
  </AdminPageShell>
}
