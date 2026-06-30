import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

export function usePresence(pairId: string | null, userId: string | undefined) {
  const [partnerOnline, setPartnerOnline] = useState(false)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    if (!pairId || !userId) return

    const channel = supabase.channel(`presence-${pairId}`, {
      config: {
        presence: {
          key: userId,
        },
      },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const presentUsers = Object.keys(state).filter(k => k !== userId)
        setPartnerOnline(presentUsers.length > 0)
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        if (key !== userId) setPartnerOnline(true)
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        if (key !== userId) setPartnerOnline(false)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: userId, online_at: new Date().toISOString() })
        }
      })

    channelRef.current = channel

    const refresh = setInterval(() => {
      channel.track({ user_id: userId, online_at: new Date().toISOString() })
    }, 15000)

    return () => {
      clearInterval(refresh)
      channel.untrack()
      supabase.removeChannel(channel)
    }
  }, [pairId, userId])

  return partnerOnline
}
