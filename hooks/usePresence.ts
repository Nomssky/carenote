import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

export function usePresence(pairId: string | null, userId: string | undefined) {
  const [partnerOnline, setPartnerOnline] = useState(false)

  useEffect(() => {
    if (!pairId || !userId) return

    const channel = supabase.channel(`presence-${pairId}`)

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const others = Object.keys(state).filter(k => k !== userId)
        setPartnerOnline(others.length > 0)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: userId })
        }
      })

    const refresh = setInterval(() => {
      channel.track({ user_id: userId })
    }, 20000)

    return () => {
      clearInterval(refresh)
      channel.untrack()
      supabase.removeChannel(channel)
    }
  }, [pairId, userId])

  return partnerOnline
}
