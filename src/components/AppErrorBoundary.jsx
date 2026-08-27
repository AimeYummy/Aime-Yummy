import React from 'react'

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[STOREFLOW UI ERROR]', error, info)
  }

  retry = () => {
    this.setState({ error: null })
    window.location.reload()
  }

  goLogin = () => {
    window.location.assign('/admin/login')
  }

  render() {
    if (!this.state.error) return this.props.children
    const message = this.state.error?.message || 'Terjadi kesalahan pada halaman.'
    const isAdmin = window.location.pathname.startsWith('/admin')

    return (
      <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
        <div className="mx-auto max-w-xl rounded-[28px] border border-rose-200 bg-white p-6 shadow-xl sm:p-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <span className="text-xl font-black">!</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-rose-500">StoreFlow Error</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight">Halaman tidak dapat ditampilkan</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Aplikasi mengalami kesalahan saat merender halaman. Pesan teknis ditampilkan di bawah supaya masalah tidak lagi terlihat sebagai halaman putih.
          </p>
          <div className="mt-5 overflow-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs leading-5 text-rose-200">{message}</div>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={this.retry} className="flex-1 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-black text-white">Muat Ulang</button>
            {isAdmin ? <button type="button" onClick={this.goLogin} className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700">Kembali ke Login</button> : null}
          </div>
        </div>
      </div>
    )
  }
}
