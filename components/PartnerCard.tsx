import { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import type { Profile } from '../types'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'
import { useColors } from '../hooks/useColors'
import { FONTS } from '../constants/theme'
import { supabase } from '../lib/supabase'

type Props = { partnerId: string | undefined; online: boolean }

function offlineText(lastSeen: string | null, now: number): string {
  if (!lastSeen) return 'Belum pernah online'
  const diff = now - new Date(lastSeen).getTime()
  if (diff < 60000) return 'barusan'
  if (diff < 300000) return 'beberapa menit lalu'
  return `${formatDistanceToNow(parseISO(lastSeen), { locale: id })} yang lalu`
}

export default function PartnerCard({ partnerId, online }: Props) {
  const { COLORS } = useColors()
  const [partner, setPartner] = useState<Profile | null>(null)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!partnerId) return
    const fetchProfile = async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', partnerId).single()
      if (data) setPartner(data)
    }
    fetchProfile()
    const poll = setInterval(fetchProfile, 30000)
    return () => clearInterval(poll)
  }, [partnerId])

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15000)
    return () => clearInterval(t)
  }, [])

  if (!partner) return null

  return (
    <View style={[s.card, { backgroundColor: COLORS.ink }]}>
      <View style={[s.dot, { backgroundColor: online ? COLORS.green : COLORS.muted }]} />
      <View style={{ flex: 1 }}>
        <Text style={[s.name, { color: COLORS.white }]}>{partner.name} 🌸</Text>
        {online ? (
          <Text style={[s.status, { color: COLORS.green }]}>online</Text>
        ) : (
          <Text style={[s.status, { color: COLORS.muted }]}>
            offline — {offlineText(partner.last_seen, now)}
          </Text>
        )}
      </View>
      <Text style={s.decor}>💌</Text>
    </View>
  )
}

const s = StyleSheet.create({
  card:   { borderRadius: 20,
            paddingHorizontal: 18, paddingVertical: 20,
            flexDirection: 'row', alignItems: 'center', gap: 14 },
  dot:         { width: 8, height: 8, borderRadius: 4 },
  name:   { fontFamily: FONTS.sansBold, fontSize: 13 },
  status: { fontFamily: FONTS.sans, fontSize: 11, marginTop: 2 },
  decor:  { position: 'absolute', right: 18, fontSize: 40, opacity: 0.15 },
})
