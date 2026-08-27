import { useEffect, useRef } from 'react'
import { supabaseBrowser } from './supabaseClient'

export function useLiveRefresh(refresh, tables = [], intervalMs = 5000) {
  const fnRef = useRef(refresh)
  useEffect(() => { fnRef.current = refresh }, [refresh])
  useEffect(() => {
    const timer = window.setInterval(() => fnRef.current?.(), intervalMs)
    const channels = []
    if (supabaseBrowser) {
      for (const table of tables) {
        const channel = supabaseBrowser.channel(`storeflow-${table}-live`)
          .on('postgres_changes', { event: '*', schema: 'public', table }, () => fnRef.current?.())
          .subscribe()
        channels.push(channel)
      }
    }
    return () => {
      window.clearInterval(timer)
      channels.forEach(channel => supabaseBrowser?.removeChannel(channel))
    }
  }, [tables.join(','), intervalMs])
}
