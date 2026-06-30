import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function usePresence(pairId: string | null, userId: string | undefined) {
  const [online, setOnline] = useState(false)

  useEffect(() => {
    if (!pairId || !userId) return

    let partnerTs = 0

    const check = () => {
      setOnline(partnerTs > 0 && Date.now() - partnerTs < 120000)
    }

    const channel = supabase.channel(`room-${pairId}`)

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        for (const key of Object.keys(state)) {
          if (key === userId) continue
          for (const p of (state[key] as any[]) || []) {
            if (p.ts && p.ts > partnerTs) partnerTs = p.ts
          }
        }
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
      channel.untrack()
      supabase.removeChannel(channel)
    }
  }, [pairId, userId])

  return online
}
