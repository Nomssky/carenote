import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function usePresence(pairId: string | null, userId: string | undefined) {
  const [online, setOnline] = useState(false)

  useEffect(() => {
    if (!pairId || !userId) return

    let lastTs = 0

    const check = () => {
      setOnline(lastTs > 0 && Date.now() - lastTs < 45000)
    }

    const channel = supabase.channel(`room-${pairId}`)

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        let found = false
        for (const key of Object.keys(state)) {
          for (const p of (state[key] as any[]) || []) {
            if (p.user_id === userId) continue
            found = true
            if (p.ts && p.ts > lastTs) lastTs = p.ts
          }
        }
        if (!found) lastTs = 0
        check()
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: userId, ts: Date.now() })
          check()
        }
      })

    const refresh = setInterval(() => {
      channel.track({ user_id: userId, ts: Date.now() }).catch(() => {})
      check()
    }, 15000)

    return () => {
      clearInterval(refresh)
      channel.untrack().catch(() => {})
      supabase.removeChannel(channel)
    }
  }, [pairId, userId])

  return online
}
