import { useEffect, useRef } from 'react'
import { supabaseBrowser } from './supabaseClient'

let channelSequence = 0

function makeChannelName(table) {
  channelSequence += 1
  const safeTable = String(table || 'table').replace(/[^a-zA-Z0-9_-]/g, '-')
  return `storeflow-${safeTable}-live-${Date.now()}-${channelSequence}`
}

export function useLiveRefresh(refresh, tables = [], intervalMs = 5000) {
  const fnRef = useRef(refresh)
  useEffect(() => { fnRef.current = refresh }, [refresh])

  useEffect(() => {
    let disposed = false
    const channels = []
    const timer = window.setInterval(() => {
      if (!disposed) fnRef.current?.()
    }, intervalMs)

    if (supabaseBrowser) {
      for (const table of tables) {
        const channel = supabaseBrowser
          .channel(makeChannelName(table))
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table },
            () => {
              if (!disposed) fnRef.current?.()
            },
          )

        channels.push(channel)

        try {
          channel.subscribe((status) => {
            if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              // Polling remains active as a safe fallback.
              console.warn(`[REALTIME] ${table}: ${status}`)
            }
          })
        } catch (error) {
          // Never let realtime setup blank the admin page.
          console.warn(`[REALTIME] ${table}: subscription setup failed`, error)
        }
      }
    }

    return () => {
      disposed = true
      window.clearInterval(timer)
      for (const channel of channels) {
        try {
          void supabaseBrowser?.removeChannel(channel)
        } catch (error) {
          console.warn('[REALTIME] cleanup failed', error)
        }
      }
    }
  }, [tables.join(','), intervalMs])
}
