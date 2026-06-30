import { useEffect, useState } from 'react'
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native'
import { usePairStore } from '../../stores/pairStore'
import { useReminderStore } from '../../stores/reminderStore'
import { useAuthStore } from '../../stores/authStore'
import { formatDate, formatTime } from '../../lib/utils'
import { format, parseISO } from 'date-fns'
import { FONTS, SPACING } from '../../constants/theme'
import { useColors } from '../../hooks/useColors'
import AnimatedEntry from '../../components/AnimatedEntry'
import RomanticBackground from '../../components/RomanticBackground'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function HistoryScreen() {
  const { COLORS } = useColors()
  const insets = useSafeAreaInsets()
  const { pair } = usePairStore()
  const { history, fetchHistory } = useReminderStore()
  const { profile } = useAuthStore()
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => { if (pair) fetchHistory(pair.id) }, [pair])

  async function onRefresh() {
    if (!pair) return
    setRefreshing(true)
    await fetchHistory(pair.id)
    setRefreshing(false)
  }

  return (
    <AnimatedEntry>
      <View style={[s.root, { backgroundColor: COLORS.rosePale }]}>
        <RomanticBackground />
        <View style={[s.header, { paddingTop: insets.top + 32 }]}>
          <Text style={[s.title, { color: COLORS.ink }]}>Riwayat</Text>
          <Text style={[s.sub, { color: COLORS.muted }]}>Hari ini, {formatDate(new Date().toISOString())}</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.roseDark} />
          }
        >
          <View style={s.list}>
            {history.map(item => (
              <View key={item.id} style={[s.card, { backgroundColor: COLORS.white, borderColor: COLORS.line }]}>
                <View style={s.row}>
                  <Text style={[s.cardLabel, { color: COLORS.ink }]} numberOfLines={1}>
                    {item.reminder?.emoji} {item.reminder?.type?.toUpperCase()} · {item.reminder?.remind_time ? formatTime(item.reminder.remind_time) : ''}
                  </Text>
                  <View style={[s.badge, item.status === 'done' ? { backgroundColor: COLORS.greenBg } : { backgroundColor: COLORS.amberBg }]}>
                    <Text style={[s.badgeText, item.status === 'done' ? { color: COLORS.greenText } : { color: COLORS.amberText }]}>
                      {item.status === 'done' ? 'Udah ✓' : 'Belum 😅'}
                    </Text>
                  </View>
                </View>

                <Text style={[s.meta, { color: COLORS.muted }]}>
                  {item.responded_at
                    ? `Dari ${item.reminder?.created_by === profile?.id ? 'Kamu buat Dia' : 'Dia'} · dijawab ${format(parseISO(item.responded_at), 'HH:mm')}`
                    : ''}
                </Text>

                {item.note && (
                  <>
                    <View style={[s.divider, { borderColor: COLORS.line }]} />
                    <Text style={[s.note, { color: COLORS.muted }]}>"{item.note}"</Text>
                  </>
                )}
              </View>
            ))}

            {history.length === 0 && (
              <View style={s.empty}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>📋</Text>
                <Text style={[s.emptyText, { color: COLORS.muted }]}>Belum ada riwayat</Text>
              </View>
            )}
          </View>

          <View style={{ height: 96 }} />
        </ScrollView>
      </View>
    </AnimatedEntry>
  )
}

const s = StyleSheet.create({
  root:          { flex: 1 },
  header:        { paddingHorizontal: SPACING.screenX, paddingBottom: 8 },
  title:         { fontFamily: FONTS.serif, fontSize: 28 },
  sub:           { fontFamily: FONTS.sans, fontSize: 12, marginTop: 4 },
  list:          { paddingHorizontal: SPACING.screenX, paddingTop: 20, gap: 12 },
  card:          { borderWidth: 1.5,
                   borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14 },
  row:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardLabel:     { fontFamily: FONTS.sansBold, fontSize: 13, flex: 1, marginRight: 12 },
  badge:         { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  badgeText:     { fontFamily: FONTS.sansBold, fontSize: 10 },
  meta:          { fontFamily: FONTS.sans, fontSize: 11, marginTop: 5 },
  divider:       { borderTopWidth: 1.5, borderStyle: 'dashed', marginVertical: 10 },
  note:          { fontFamily: FONTS.sans, fontSize: 12, fontStyle: 'italic' },
  empty:         { alignItems: 'center', marginTop: 80 },
  emptyText:     { fontFamily: FONTS.sans, fontSize: 14 },
})
