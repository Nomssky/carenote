import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Pair, Profile } from '../types'

type PairState = {
  pair: Pair | null
  partner: Profile | null
  loading: boolean
  fetchPair: () => Promise<void>
  createPair: () => Promise<string>
  joinPair: (code: string) => Promise<void>
  subscribePair: (onUpdate: () => void) => () => void
  disconnectPair: () => Promise<void>
}

export const usePairStore = create<PairState>((set) => ({
  pair: null,
  partner: null,
  loading: true,

  fetchPair: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: pairs } = await supabase
      .from('pairs')
      .select('*')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .in('status', ['active', 'pending'])
      .order('created_at', { ascending: false })
      .limit(1)

    const pair = pairs?.[0] ?? null

    if (!pair) return set({ pair: null, partner: null, loading: false })

    const partnerId = pair.user_a === user.id ? pair.user_b : pair.user_a
    const { data: partner } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', partnerId)
      .single()

    set({ pair, partner, loading: false })
  },

  createPair: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()

    await supabase
      .from('pairs')
      .update({ status: 'inactive' })
      .or(`user_a.eq.${user!.id},user_b.eq.${user!.id}`)
      .eq('status', 'active')

    const { data } = await supabase
      .from('pairs')
      .insert({ user_a: user!.id, pair_code: code })
      .select()
      .single()

    set({ pair: data })
    return code
  },

  subscribePair: (onUpdate: () => void) => {
    const channel = supabase
      .channel('pair-changes-' + Math.random())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pairs',
      }, () => onUpdate())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  },

  joinPair: async (code: string) => {
    const { error } = await supabase.rpc('join_pair', {
      p_code: code.toUpperCase(),
    })

    if (error) throw new Error(error.message)

    const { fetchPair } = usePairStore.getState()
    await fetchPair()
  },

  disconnectPair: async () => {
    const { error } = await supabase.rpc('disconnect_pair')

    if (error) throw new Error(error.message)

    set({ pair: null, partner: null })
  },
}))
