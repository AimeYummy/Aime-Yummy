import React from 'react'
import { Navigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { useAdminAuth } from '../../context/AdminAuthContext'

export default function AdminPageShell({ title, subtitle, children }) {
  const { isAdmin, loading } = useAdminAuth()
  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_right,_#fdfcfb_0%,_#e6e0f7_42%,_#eef2ff_100%)] px-6 dark:bg-slate-950"><div className="rounded-[28px] border border-white/70 bg-white/70 px-6 py-5 text-center shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5"><div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600 dark:border-white/10 dark:border-t-indigo-400"/><p className="text-sm font-bold text-slate-600 dark:text-slate-300">Memuat sesi admin...</p></div></div>
  }
  if (!isAdmin) return <Navigate to="/admin/login" replace />
  return <AdminLayout title={title} subtitle={subtitle}>{children}</AdminLayout>
}
