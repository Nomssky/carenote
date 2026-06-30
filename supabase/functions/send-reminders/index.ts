import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async () => {
  const now = new Date()
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000)
  const currentTime = `${String(wib.getUTCHours()).padStart(2, '0')}:${String(wib.getUTCMinutes()).padStart(2, '0')}`
  const currentDay = wib.getUTCDay() === 0 ? 7 : wib.getUTCDay()

  const { data: reminders, error } = await supabase
    .from('reminders')
    .select('id, message, emoji, type, target_user, created_by')
    .eq('is_active', true)
    .eq('remind_time', currentTime)
    .contains('repeat_days', [currentDay])

  if (error) return new Response(JSON.stringify({ error }), { status: 500 })
  if (!reminders?.length) return new Response('no reminders', { status: 200 })

  const userIds = [...new Set(reminders.map(r => r.target_user))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, push_token')
    .in('id', userIds)

  const profileMap = new Map(profiles?.map(p => [p.id, p]) ?? [])

  const creatorIds = [...new Set(reminders.map(r => r.created_by))]
  const { data: creators } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', creatorIds)

  const creatorMap = new Map(creators?.map(c => [c.id, c]) ?? [])

  const pushMessages = reminders
    .map(r => {
      const target = profileMap.get(r.target_user)
      const creator = creatorMap.get(r.created_by)
      if (!target?.push_token) return null
      return {
        to: target.push_token,
        title: `Dari ${creator?.name ?? 'Dia'} ${r.emoji}`,
        body: r.message,
        data: { reminder_id: r.id },
        categoryIdentifier: 'REMINDER_RESPONSE',
        sound: 'default',
      }
    })
    .filter(Boolean)

  if (pushMessages.length > 0) {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pushMessages),
    })
  }

  return new Response(JSON.stringify({ sent: pushMessages.length }), { status: 200 })
})
