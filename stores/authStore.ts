import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

type AuthState = {
  user: any | null
  profile: Profile | null
  loading: boolean
  setUser: (user: any) => void
  setProfile: (profile: Profile) => void
  fetchProfile: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),

  fetchProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return set({ loading: false })

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    void supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', user.id)

    set({ user, profile: data, loading: false })
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },
}))
