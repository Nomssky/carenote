import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../stores/authStore'
import { usePairStore } from '../../stores/pairStore'
import { useReminderStore } from '../../stores/reminderStore'
import TypeChip from '../../components/TypeChip'
import DayPicker from '../../components/DayPicker'
import TimePicker from '../../components/TimePicker'
import { REMINDER_PRESETS } from '../../constants/reminders'
import { FONTS, SPACING } from '../../constants/theme'
import { useColors } from '../../hooks/useColors'
import AnimatedEntry from '../../components/AnimatedEntry'
import RomanticBackground from '../../components/RomanticBackground'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { ReminderType } from '../../types'

export default function CreateScreen() {
  const { COLORS, SHADOW } = useColors()
  const router = useRouter()
  const { profile } = useAuthStore()
  const { pair, partner } = usePairStore()
  const { createReminder, fetchTodayReminders } = useReminderStore()

  const insets = useSafeAreaInsets()
  const [type, setType] = useState<ReminderType>('makan')
  const [message, setMessage] = useState(REMINDER_PRESETS[0].defaultMessage)
  const [time, setTime] = useState('12:00')
  const [days, setDays] = useState([1, 2, 3, 4, 5])
  const [focused, setFocused] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const preset = REMINDER_PRESETS.find(p => p.type === type)

  function handleSelectType(t: ReminderType) {
    setType(t)
    const p = REMINDER_PRESETS.find(x => x.type === t)
    if (p?.defaultMessage) setMessage(p.defaultMessage)
  }

  async function handleSubmit() {
    if (!pair || !partner || !profile) {
      Alert.alert('Error', 'Data pasangan belum siap. Coba buka dari halaman utama.')
      return
    }
    if (!message.trim()) return Alert.alert('Error', 'Tulis pesan dulu ya')
    if (!days.length) return Alert.alert('Error', 'Pilih minimal 1 hari')
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) return Alert.alert('Error', 'Format jam HH:MM (contoh: 14:30)')
    setLoading(true)
    try {
      await createReminder({
        pair_id: pair.id,
        created_by: profile.id,
        target_user: partner.id,
        type,
        message: message.trim(),
        emoji: preset?.emoji ?? '💌',
        remind_time: time + ':00',
        repeat_days: days,
        is_active: true,
      })
      await fetchTodayReminders(pair.id)
      router.back()
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatedEntry>
      <View style={[s.root, { backgroundColor: COLORS.rosePale }]}>
        <RomanticBackground />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[s.header, { paddingTop: insets.top + 32 }]}>
            <TouchableOpacity style={[s.backBtn, { borderColor: COLORS.line }]} onPress={() => router.back()}>
              <Text style={{ color: COLORS.ink, fontSize: 16 }}>←</Text>
            </TouchableOpacity>
            <Text style={[s.title, { color: COLORS.ink }]}>Reminder Baru</Text>
          </View>

          {partner && (
            <View style={[s.banner, { backgroundColor: COLORS.blush }]}>
              <Text style={{ fontSize: 16 }}>💌</Text>
              <Text style={[s.bannerText, { color: COLORS.ink }]}>
                Akan dikirim ke <Text style={s.bannerBold}>{partner.name}</Text>
              </Text>
            </View>
          )}

          <Text style={[s.sectionLabel, { color: COLORS.muted }]}>Jenis</Text>
          <View style={s.typeGrid}>
            {REMINDER_PRESETS.map(p => (
              <TypeChip
                key={p.type}
                label={p.label}
                emoji={p.emoji}
                color={p.color}
                selected={type === p.type}
                onPress={() => handleSelectType(p.type)}
              />
            ))}
          </View>

          <Text style={[s.sectionLabel, { color: COLORS.muted }]}>Pesan</Text>
          <View style={s.fieldWrap}>
            <TextInput
              style={[s.input, { backgroundColor: COLORS.white, borderColor: COLORS.line, color: COLORS.ink }, focused === 'msg' && { borderColor: COLORS.roseDark }]}
              value={message}
              onChangeText={setMessage}
              placeholder="Tulis pesan untuk dia..."
              placeholderTextColor={COLORS.muted}
              multiline
              maxLength={100}
              onFocus={() => setFocused('msg')}
              onBlur={() => setFocused(null)}
            />
            <Text style={[s.counter, { color: COLORS.muted }]}>{message.length}/100</Text>
          </View>

          <Text style={[s.sectionLabel, { color: COLORS.muted }]}>Jam</Text>
          <View style={s.fieldWrap}>
            <TimePicker
              value={time}
              onChange={setTime}
            />
          </View>

          <Text style={[s.sectionLabel, { color: COLORS.muted }]}>Hari</Text>
          <View style={s.fieldWrap}>
            <DayPicker selected={days} onChange={setDays} />
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        <View style={[s.footer, { borderTopColor: COLORS.line, backgroundColor: COLORS.rosePale }]}>
          <TouchableOpacity
            style={[s.submitBtn, { backgroundColor: COLORS.roseDark }, SHADOW.button, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={s.submitText}>
              {loading ? 'Mengirim...' : `${preset?.emoji ?? '💌'} Kirim ke ${partner?.name ?? 'Dia'}`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </AnimatedEntry>
  )
}

const s = StyleSheet.create({
  root:         { flex: 1 },
  header:       { flexDirection: 'row', alignItems: 'center', gap: 12,
                  paddingHorizontal: SPACING.screenX, paddingBottom: 8 },
  backBtn:      { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5,
                  alignItems: 'center', justifyContent: 'center' },
  title:        { fontFamily: FONTS.serif, fontSize: 22 },
  banner:       { flexDirection: 'row', alignItems: 'center', gap: 8,
                  marginHorizontal: SPACING.screenX, marginTop: 16,
                  borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 },
  bannerText:   { fontFamily: FONTS.sans, fontSize: 13 },
  bannerBold:   { fontFamily: FONTS.sansBold },
  sectionLabel: { marginHorizontal: SPACING.screenX, marginTop: 20, marginBottom: 8,
                  fontFamily: FONTS.sansSemiBold, fontSize: 11,
                  letterSpacing: 1.2, textTransform: 'uppercase' },
  typeGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10,
                  paddingHorizontal: SPACING.screenX },
  fieldWrap:    { paddingHorizontal: SPACING.screenX },
  input:        { borderWidth: 1.5,
                  borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
                  fontFamily: FONTS.sans, fontSize: 14 },
  counter:      { fontFamily: FONTS.sans, fontSize: 12,
                  textAlign: 'right', marginTop: 4 },
  footer:       { paddingHorizontal: SPACING.screenX, paddingBottom: 40, paddingTop: 16,
                  borderTopWidth: 1.5 },
  submitBtn:    { borderRadius: 16, paddingVertical: 15,
                  alignItems: 'center' },
  submitText:   { fontFamily: FONTS.sansBold, fontSize: 15, color: '#fff' },
})
