import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Reminder, Confirmation, ReminderWithConfirmation } from '../types'
import { todayDate, getDayOfWeek } from '../lib/utils'

type ReminderState = {
  reminders: ReminderWithConfirmation[]
  history: (Confirmation & { reminder?: Reminder })[]
  loading: boolean
  fetchTodayReminders: (pairId: string) => Promise<void>
  fetchHistory: (pairId: string) => Promise<void>
  createReminder: (data: Partial<Reminder>) => Promise<void>
  confirm: (reminderId: string, status: 'done' | 'skip', note?: string, photoUrl?: string) => Promise<void>
  deleteReminder: (reminderId: string) => Promise<void>
  subscribeConfirmations: (pairId: string) => () => void
  subscribeReminders: (pairId: string, fetchFn: () => Promise<void>) => () => void
}

export const useReminderStore = create<ReminderState>((set) => ({
  reminders: [],
  history: [],
  loading: true,

  fetchTodayReminders: async (pairId: string) => {
    const today = getDayOfWeek()

    const { data: reminders } = await supabase
      .from('reminders')
      .select('*')
      .eq('pair_id', pairId)
      .eq('is_active', true)
      .contains('repeat_days', [today])
      .order('remind_time')

    if (!reminders?.length) return set({ reminders: [], loading: false })

    const { data: confirmations } = await supabase
      .from('confirmations')
      .select('*')
      .in('reminder_id', reminders.map(r => r.id))
      .eq('date', todayDate())

    const merged: ReminderWithConfirmation[] = reminders.map(r => ({
      ...r,
      confirmation: confirmations?.find(c => c.reminder_id === r.id),
    }))

    set({ reminders: merged, loading: false })
  },

  fetchHistory: async (pairId: string) => {
    const { data: reminderIds } = await supabase
      .from('reminders')
      .select('id')
      .eq('pair_id', pairId)

    if (!reminderIds?.length) return set({ history: [] })

    const { data } = await supabase
      .from('confirmations')
      .select(`*, reminder:reminders(*)`)
      .in('reminder_id', reminderIds.map(r => r.id))
      .order('responded_at', { ascending: false })
      .limit(50)

    set({ history: data ?? [] })
  },

  createReminder: async (data: Partial<Reminder>) => {
    const { error } = await supabase.from('reminders').insert(data)
    if (error) throw error
  },

  deleteReminder: async (reminderId: string) => {
    const { error } = await supabase.from('reminders').update({ is_active: false }).eq('id', reminderId)
    if (error) throw error

    set(state => ({
      reminders: state.reminders.filter(r => r.id !== reminderId),
    }))
  },

  confirm: async (reminderId: string, status: 'done' | 'skip', note?: string, photoUrl?: string) => {
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('confirmations').upsert({
      reminder_id: reminderId,
      user_id: user!.id,
      status,
      note,
      photo_url: photoUrl,
      date: todayDate(),
    }, { onConflict: 'reminder_id,date,user_id' })

    set(state => ({
      reminders: state.reminders.map(r =>
        r.id === reminderId
          ? { ...r, confirmation: { status, date: todayDate(), photo_url: photoUrl } as any }
          : r
      )
    }))
  },

  subscribeConfirmations: (pairId: string) => {
    const channel = supabase
      .channel('confirmations-' + pairId)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'confirmations',
      }, (payload) => {
        const conf = payload.new as Confirmation
        set(state => ({
          reminders: state.reminders.map(r =>
            r.id === conf.reminder_id ? { ...r, confirmation: conf } : r
          )
        }))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  },

  subscribeReminders: (pairId: string, fetchFn: () => Promise<void>) => {
    const channel = supabase
      .channel('reminders-' + pairId)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reminders',
        filter: `pair_id=eq.${pairId}`,
      }, () => fetchFn())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  },
}))
