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
    .select('id, message, emoji, type, created_by, target_user')
    .eq('is_active', true)
    .eq('remind_time', currentTime)
    .contains('repeat_days', [currentDay])

  if (error) return new Response(JSON.stringify({ error }), { status: 500 })
  if (!reminders?.length) return new Response('no reminders', { status: 200 })

  const userIds = [...new Set(reminders.flatMap(r => [r.created_by, r.target_user]))]

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, push_token')
    .in('id', userIds)

  const profileMap = new Map(profiles?.map(p => [p.id, p]) ?? [])

  const pushMessages = reminders.flatMap(r => {
    const toSend: any[] = []
    const creator = profileMap.get(r.created_by)

    const target = profileMap.get(r.target_user)
    if (target?.push_token) {
      toSend.push({
        to: target.push_token,
        title: `Dari ${creator?.name ?? 'Dia'} ${r.emoji}`,
        body: r.message,
        data: { reminder_id: r.id },
        categoryIdentifier: 'REMINDER_RESPONSE',
        sound: 'default',
      })
    }

    if (creator?.push_token && creator.id !== r.target_user) {
      toSend.push({
        to: creator.push_token,
        title: `Ngingetin ${target?.name ?? 'Dia'} ${r.emoji}`,
        body: `"${r.message}" — tunggu responnya ya`,
        data: { reminder_id: r.id },
        sound: 'default',
      })
    }

    return toSend
  })

  if (pushMessages.length > 0) {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pushMessages),
    })
  }

  return new Response(JSON.stringify({ sent: pushMessages.length }), { status: 200 })
})
