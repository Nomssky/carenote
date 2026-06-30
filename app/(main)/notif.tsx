import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useReminderStore } from '../../stores/reminderStore'
import { FONTS } from '../../constants/theme'
import { useColors } from '../../hooks/useColors'
import RomanticBackground from '../../components/RomanticBackground'
import { REMINDER_PRESETS } from '../../constants/reminders'

export default function NotifScreen() {
  const { COLORS, SHADOW } = useColors()
  const router = useRouter()
  const params = useLocalSearchParams<{ reminder_id: string }>()
  const { reminders, confirm } = useReminderStore()
  const [loading, setLoading] = useState<'done' | 'skip' | null>(null)
  const fadeAnim = useState(new Animated.Value(0))[0]

  const reminder = reminders.find(r => r.id === params.reminder_id) ?? reminders[0]
  const preset = REMINDER_PRESETS.find(p => p.type === reminder?.type)

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start()
  }, [])

  async function handleConfirm(status: 'done' | 'skip') {
    if (!reminder) return
    setLoading(status)
    await confirm(reminder.id, status)
    setLoading(null)
    router.back()
  }

  if (!reminder) {
    return (
      <View style={[s.root, { backgroundColor: COLORS.rosePale }]}>
        <RomanticBackground />
        <Text style={[s.from, { color: COLORS.muted }]}>Tidak ada reminder</Text>
      </View>
    )
  }

  const timeStr = reminder.remind_time?.slice(0, 5) ?? ''

  return (
    <Animated.View style={[s.root, { backgroundColor: COLORS.rosePale }, { opacity: fadeAnim }]}>
      <RomanticBackground />
      <Text style={[s.from, { color: COLORS.muted }]}>Dari {reminder.creator_name ?? 'Dia'} 🌸</Text>
      <Text style={s.emoji}>{reminder.emoji ?? preset?.emoji ?? '💌'}</Text>
      <Text style={[s.message, { color: COLORS.ink }]}>{reminder.message}</Text>
      <Text style={[s.time, { color: COLORS.muted }]}>Barusan · {timeStr}</Text>

      <View style={s.actions}>
        <TouchableOpacity
          style={[s.btnPrimary, { backgroundColor: COLORS.roseDark }, SHADOW.button, loading === 'done' && { opacity: 0.7 }]}
          onPress={() => handleConfirm('done')}
          disabled={!!loading}
          activeOpacity={0.85}
        >
          <Text style={s.btnPrimaryText}>
            {loading === 'done' ? 'Menyimpan...' : '✅ Udah, makasih!'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.btnSecondary, { backgroundColor: COLORS.white, borderColor: COLORS.line }, loading === 'skip' && { opacity: 0.7 }]}
          onPress={() => handleConfirm('skip')}
          disabled={!!loading}
          activeOpacity={0.85}
        >
          <Text style={[s.btnSecondaryText, { color: COLORS.ink }]}>
            {loading === 'skip' ? 'Menyimpan...' : '😅 Belum, bentar lagi'}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  )
}

const s = StyleSheet.create({
  root:             { flex: 1,
                      alignItems: 'center', justifyContent: 'center',
                      paddingHorizontal: 28 },
  from:             { fontFamily: FONTS.sansSemiBold, fontSize: 12,
                      letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 16 },
  emoji:            { fontSize: 72, marginBottom: 20 },
  message:          { fontFamily: FONTS.serif, fontSize: 28,
                      textAlign: 'center', lineHeight: 36, marginBottom: 8 },
  time:             { fontFamily: FONTS.sans, fontSize: 12, marginBottom: 40 },
  actions:          { width: '100%', gap: 12 },
  btnPrimary:       { borderRadius: 16,
                      paddingVertical: 16, alignItems: 'center' },
  btnPrimaryText:   { fontFamily: FONTS.sansBold, fontSize: 15, color: '#fff' },
  btnSecondary:     { borderRadius: 16,
                      paddingVertical: 16, alignItems: 'center',
                      borderWidth: 1.5 },
  btnSecondaryText: { fontFamily: FONTS.sansBold, fontSize: 15 },
})
