import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async () => {
  const now = new Date()
  const currentTime = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`
  const currentDay = now.getUTCDay() === 0 ? 7 : now.getUTCDay()

  const { data: reminders, error } = await supabase
    .from('reminders')
    .select(`
      id, message, emoji, type, target_user,
      profiles!reminders_created_by_fkey(name),
      target_profile:profiles!reminders_target_user_fkey(push_token)
    `)
    .eq('is_active', true)
    .eq('remind_time', currentTime)
    .contains('repeat_days', [currentDay])

  if (error) return new Response(JSON.stringify({ error }), { status: 500 })
  if (!reminders?.length) return new Response('no reminders', { status: 200 })

  const messages = reminders
    .filter(r => r.target_profile?.push_token)
    .map(r => ({
      to: r.target_profile.push_token,
      title: `Dari ${r.profiles?.name ?? 'Dia'} ${r.emoji}`,
      body: r.message,
      data: { reminder_id: r.id },
      categoryIdentifier: 'REMINDER_RESPONSE',
      sound: 'default',
    }))

  if (messages.length > 0) {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    })
  }

  return new Response(JSON.stringify({ sent: messages.length }), { status: 200 })
})
