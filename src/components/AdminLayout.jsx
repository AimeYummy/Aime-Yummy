import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import AdminIcon from './AdminIcon'

const links = [
  ['/admin', 'Dashboard', 'dashboard'],
  ['/admin/menu', 'Menu', 'menu'],
  ['/admin/stock', 'Stok', 'stock'],
  ['/admin/tables', 'Meja', 'table'],
  ['/admin/sales', 'Penjualan', 'sales'],
  ['/admin/performance', 'Performa', 'performance'],
  ['/admin/export', 'Ekspor & Cetak', 'export'],
]

export default function AdminLayout({ children, title, subtitle = '' }) {
  const nav = useNavigate()
  const { user, logout } = useAdminAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('admin-theme') === 'dark'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('admin-theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    setSidebarOpen(false)
  }, [title])

  const exit = async () => {
    await logout()
    nav('/')
  }

  const navLink = ({ isActive }) => `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${isActive ? 'bg-indigo-50 text-indigo-600 shadow-sm dark:bg-indigo-500/15 dark:text-indigo-300' : 'text-slate-600 hover:bg-white/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'}`

  return (
    <div className="font-sans min-h-screen bg-[radial-gradient(circle_at_top_right,_#fdfcfb_0%,_#e6e0f7_42%,_#eef2ff_100%)] text-slate-800 dark:bg-[radial-gradient(circle_at_top_right,_#0f172a_0%,_#17152f_48%,_#0f172a_100%)] dark:text-slate-100">
      <div className={`fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-[2px] transition-opacity lg:hidden ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`fixed inset-y-0 left-0 z-40 m-0 flex w-[280px] flex-col overflow-hidden rounded-r-[34px] border border-white/70 bg-white/65 shadow-2xl backdrop-blur-2xl transition-transform duration-300 dark:border-white/10 dark:bg-slate-900/75 lg:inset-y-4 lg:left-4 lg:rounded-[34px] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-start justify-between border-b border-white/60 p-5 dark:border-white/10">
          <div>
            <div className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Store<span className="text-indigo-600 dark:text-indigo-400">Flow</span></div>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Penjualan · Stok · Meja</p>
          </div>
          <button type="button" className="rounded-xl bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 lg:hidden dark:bg-white/10 dark:text-slate-300" onClick={() => setSidebarOpen(false)} aria-label="Tutup menu">
            <AdminIcon name="close" size={16} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <NavLink to="/" end className="group mb-3 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 transition-all hover:bg-white/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 group-hover:text-indigo-600 dark:bg-white/10 dark:text-slate-300 dark:group-hover:text-indigo-300"><AdminIcon name="external" size={17} /></span>
            Lihat Website
          </NavLink>

          <div className="px-3 pb-2 pt-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Workspace Admin</div>
          {links.map(([to, label, icon]) => (
            <NavLink key={to} to={to} end={to === '/admin'} className={navLink}>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100/80 text-slate-500 transition group-hover:bg-white group-hover:text-indigo-600 dark:bg-white/5 dark:text-slate-300 dark:group-hover:bg-white/10 dark:group-hover:text-indigo-300">
                <AdminIcon name={icon} size={18} />
              </span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/60 p-3 dark:border-white/10">
          <div className="mb-2 rounded-2xl bg-slate-50/80 px-4 py-3 dark:bg-white/5">
            <p className="truncate text-xs font-bold text-slate-700 dark:text-slate-200">{user?.email || 'Admin'}</p>
            <p className="mt-1 text-[10px] font-medium text-slate-400">Supabase Auth</p>
          </div>
          <button type="button" onClick={exit} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10">
            <AdminIcon name="logout" size={17} /> Keluar
          </button>
        </div>
      </aside>

      <main className="min-h-screen lg:pl-[312px]">
        <header className="sticky top-0 z-20 border-b border-white/40 bg-white/30 px-4 py-4 backdrop-blur-xl dark:border-white/5 dark:bg-slate-950/25 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button type="button" onClick={() => setSidebarOpen(true)} className="rounded-2xl border border-white/70 bg-white/70 p-2.5 text-slate-700 shadow-sm lg:hidden dark:border-white/10 dark:bg-white/10 dark:text-slate-100" aria-label="Buka menu">
                <AdminIcon name="menuIcon" size={19} />
              </button>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-indigo-500 dark:text-indigo-300">StoreFlow Admin</p>
                <h1 className="mt-1 truncate text-xl font-black tracking-tight text-slate-900 dark:text-white sm:text-2xl">{title}</h1>
                {subtitle ? <p className="mt-1 hidden text-sm font-medium text-slate-500 dark:text-slate-400 sm:block">{subtitle}</p> : null}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button type="button" onClick={() => setDark(v => !v)} className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/70 bg-white/70 text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:text-indigo-600 dark:border-white/10 dark:bg-white/10 dark:text-slate-300" aria-label="Ubah tema">
                <AdminIcon name={dark ? 'sun' : 'moon'} size={17} />
              </button>
              <button type="button" onClick={() => nav('/')} className="hidden rounded-2xl border border-white/70 bg-white/70 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-600 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-indigo-400/30 sm:flex sm:items-center sm:gap-2">
                <AdminIcon name="external" size={15} /> Website
              </button>
            </div>
          </div>
        </header>

        <section className="mx-auto w-full max-w-[1440px] px-4 py-5 pb-10 sm:px-6 sm:py-7 lg:px-8">
          {children}
        </section>
      </main>
    </div>
  )
}
