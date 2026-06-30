import { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import type { Profile } from '../types'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

type Props = { partner: Profile | null }

function lastSeenText(lastSeen: string | null, now: number): string {
  if (!lastSeen) return 'Belum pernah online'
  const diff = now - new Date(lastSeen).getTime()
  if (diff < 60000) return 'Online · barusan'
  if (diff < 300000) return 'Online · beberapa menit lalu'
  return `Online · ${formatDistanceToNow(parseISO(lastSeen), { locale: id })} yang lalu`
}

export default function PartnerCard({ partner }: Props) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15000)
    return () => clearInterval(t)
  }, [])

  if (!partner) return null

  const diff = now - new Date(partner.last_seen ?? 0).getTime()
  const isOnline = !!partner.last_seen && diff < 300000

  return (
    <View style={s.card}>
      <View style={[s.dot, isOnline ? s.dotOnline : s.dotOffline]} />
      <View style={{ flex: 1 }}>
        <Text style={s.name}>{partner.name} 🌸</Text>
        <Text style={s.status}>{lastSeenText(partner.last_seen, now)}</Text>
      </View>
      <Text style={s.decor}>💌</Text>
    </View>
  )
}

const s = StyleSheet.create({
  card:   { backgroundColor: '#1C1018', borderRadius: 20,
            paddingHorizontal: 18, paddingVertical: 20,
            flexDirection: 'row', alignItems: 'center', gap: 14 },
  dot:         { width: 8, height: 8, borderRadius: 4, backgroundColor: '#6BCB8B' },
  dotOnline:   { backgroundColor: '#6BCB8B' },
  dotOffline:  { backgroundColor: 'rgba(255,255,255,0.2)' },
  name:   { fontFamily: 'DMSans_700Bold', fontSize: 13, color: '#fff' },
  status: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  decor:  { position: 'absolute', right: 18, fontSize: 40, opacity: 0.15 },
})
