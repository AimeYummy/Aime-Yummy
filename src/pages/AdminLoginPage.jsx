import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAdminAuth } from '../context/AdminAuthContext'
import AdminIcon from '../components/AdminIcon'

export default function AdminLoginPage() {
  const nav = useNavigate()
  const { login } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [dark, setDark] = useState(() => typeof window !== 'undefined' && localStorage.getItem('admin-theme') === 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('admin-theme', dark ? 'dark' : 'light')
  }, [dark])

  const submit = async e => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !pw) return setError('Email dan password wajib diisi.')
    setLoading(true)
    try {
      await login(email, pw)
      nav('/admin')
    } catch (err) {
      setError(err?.message || 'Login gagal. Silakan periksa akun Anda.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="font-sans relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,_#fdfcfb_0%,_#ede9fe_48%,_#e0e7ff_100%)] px-4 py-8 text-slate-800 dark:bg-[radial-gradient(circle_at_top_right,_#0f172a_0%,_#221c45_48%,_#111827_100%)] dark:text-slate-100 sm:px-6">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-purple-500/15 blur-3xl" />

      <button type="button" onClick={() => setDark(v => !v)} className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/70 bg-white/70 text-slate-500 shadow-lg backdrop-blur-xl transition hover:-translate-y-0.5 hover:text-indigo-600 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 sm:right-6 sm:top-6" aria-label="Ubah tema">
        <AdminIcon name={dark ? 'sun' : 'moon'} size={17} />
      </button>

      <div className="relative z-10 grid min-h-[calc(100vh-4rem)] place-items-center">
        <motion.div initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.35 }} className="w-full max-w-md rounded-[34px] border border-white/70 bg-white/65 p-6 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/70 sm:p-8">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-indigo-950/50"><span className="text-xl font-black">SF</span></div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Store<span className="text-indigo-600 dark:text-indigo-400">Flow</span></h1>
            <p className="mt-1 text-sm font-medium text-slate-400">Panel Admin AIME-Dimsum</p>
          </div>

          <div className="mx-auto mb-6 h-1.5 w-20 rounded-full bg-indigo-600" />
          <div className="mb-6">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-indigo-500 dark:text-indigo-300">Admin</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Sign In</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Masuk menggunakan akun Supabase Auth untuk mengelola menu, stok, meja, dan transaksi.</p>
          </div>

          {error ? <div className="mb-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-400/15 dark:bg-rose-500/10 dark:text-rose-300"><AdminIcon name="alert" size={17} className="mt-0.5 shrink-0" /><span>{error}</span></div> : null}

          <form className="space-y-4" onSubmit={submit}>
            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Email</span>
              <span className="relative block">
                <AdminIcon name="mail" size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@domain.com" autoComplete="email" className="w-full rounded-2xl border border-white/70 bg-white/70 py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-400/40 dark:focus:ring-indigo-500/10" />
              </span>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Password</span>
              <span className="relative block">
                <AdminIcon name="lock" size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Password" autoComplete="current-password" className="w-full rounded-2xl border border-white/70 bg-white/70 py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-400/40 dark:focus:ring-indigo-500/10" />
              </span>
            </label>

            <div className="flex flex-col gap-2 pt-2 sm:flex-row">
              <button type="button" onClick={() => nav('/')} className="order-2 flex-1 rounded-2xl border border-white/70 bg-white/70 px-4 py-3.5 text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-indigo-400/30 sm:order-1">Kembali</button>
              <button type="submit" disabled={loading} className="order-1 flex-1 rounded-2xl bg-indigo-600 px-4 py-3.5 text-sm font-black text-white shadow-xl shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-indigo-950/40 sm:order-2">{loading ? 'Memproses...' : 'Sign In'}</button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
