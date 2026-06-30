import { useEffect } from 'react'
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, StyleSheet } from 'react-native'
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated'
import { useAuthStore } from '../../stores/authStore'
import { usePairStore } from '../../stores/pairStore'
import { useReminderStore } from '../../stores/reminderStore'

import ReminderCard from '../../components/ReminderCard'
import PartnerCard from '../../components/PartnerCard'
import { useRouter } from 'expo-router'
import { formatDate } from '../../lib/utils'
import { FONTS, SPACING } from '../../constants/theme'
import { useColors } from '../../hooks/useColors'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import RomanticBackground from '../../components/RomanticBackground'

export default function HomeScreen() {
  const { COLORS, SHADOW } = useColors()
  const router = useRouter()
  const { profile } = useAuthStore()
  const insets = useSafeAreaInsets()
  const fabScale = useSharedValue(1)
  const fabAnim = useAnimatedStyle(() => ({ transform: [{ scale: fabScale.value }] }))
  const { pair, partner, fetchPair, subscribePair } = usePairStore()
  const { reminders, loading, fetchTodayReminders, subscribeConfirmations, subscribeReminders } = useReminderStore()

  useEffect(() => { fetchPair() }, [])

  useEffect(() => {
    const unsubPair = subscribePair(() => fetchPair())
    const poll = setInterval(() => fetchPair(), 15000)
    return () => { unsubPair(); clearInterval(poll) }
  }, [])

  useEffect(() => {
    if (!pair) return

    fetchTodayReminders(pair.id)

    const unsubConf = subscribeConfirmations(pair.id)
    const unsubRem = subscribeReminders(pair.id, () => fetchTodayReminders(pair.id))

    return () => { unsubConf(); unsubRem() }
  }, [pair])

  const myReminders = reminders.filter(r => r.target_user === profile?.id)
  const theirReminders = reminders.filter(r => r.created_by === profile?.id && r.target_user !== profile?.id)

  if (!pair) {
    return (
      <View style={[s.emptyRoot, { backgroundColor: COLORS.rosePale }]}>
        <RomanticBackground />
        <Text style={{ fontSize: 60, marginBottom: 16 }}>💌</Text>
        <Text style={[s.emptyTitle, { color: COLORS.ink }]}>Belum terhubung</Text>
        <Text style={[s.emptySub, { color: COLORS.muted }]}>Hubungkan dulu dengan dia untuk mulai saling ngingetin</Text>
        <TouchableOpacity style={[s.emptyBtn, { backgroundColor: COLORS.roseDark }]} onPress={() => router.push('/(main)/pair')}>
          <Text style={s.emptyBtnText}>Hubungkan Sekarang</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={[s.root, { backgroundColor: COLORS.rosePale }]}>
      <RomanticBackground />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => pair && fetchTodayReminders(pair.id)}
            tintColor={COLORS.roseDark}
          />
        }
      >
        <View style={[s.header, { paddingTop: insets.top + 32 }]}>
          <View style={{ flex: 1 }}>
            <Text style={[s.greeting, { color: COLORS.ink }]}>
              Halo, <Text style={[s.greetingName, { color: COLORS.roseDark }]}>{profile?.name}</Text> 👋
            </Text>
            <Text style={[s.greetingSub, { color: COLORS.muted }]}>{formatDate(new Date().toISOString())} · {reminders.length} reminder hari ini</Text>
          </View>
          <View style={[s.avatar, { backgroundColor: COLORS.blush, borderColor: COLORS.line }]}>
            <Text style={{ fontSize: 20 }}>🧑‍💻</Text>
          </View>
        </View>

        <View style={s.partnerWrap}>
          <PartnerCard partner={partner} />
        </View>

        {myReminders.length > 0 && (
          <>
            <Text style={[s.sectionLabel, { color: COLORS.muted }]}>Dari Dia Buat Kamu</Text>
            <View style={s.cardList}>
              {myReminders.map((r, i) => <ReminderCard key={r.id} reminder={r} isOwn={false} index={i} />)}
            </View>
          </>
        )}

        {theirReminders.length > 0 && (
          <>
            <Text style={[s.sectionLabel, { color: COLORS.muted }]}>Yang Kamu Buat Buat Dia</Text>
            <View style={s.cardList}>
              {theirReminders.map((r, i) => <ReminderCard key={r.id} reminder={r} isOwn={true} index={i} />)}
            </View>
          </>
        )}

        {reminders.length === 0 && !loading && (
          <View style={s.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🗓</Text>
            <Text style={[s.emptyText, { color: COLORS.muted }]}>Belum ada reminder hari ini.{'\n'}Tap + untuk buat yang pertama!</Text>
          </View>
        )}

        <View style={{ height: 96 }} />
      </ScrollView>

      <Animated.View style={[s.fab, { backgroundColor: COLORS.roseDark }, SHADOW.fab, fabAnim]}>
        <TouchableOpacity
          onPress={() => router.push('/(main)/create')}
          onPressIn={() => { fabScale.value = withSpring(0.88) }}
          onPressOut={() => { fabScale.value = withSpring(1) }}
          style={{ width: 52, height: 52, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: '#fff', fontSize: 28, lineHeight: 32 }}>+</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}

const s = StyleSheet.create({
  root:           { flex: 1 },
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
                    paddingHorizontal: SPACING.screenX },
  greeting:       { fontFamily: FONTS.serif, fontSize: 28, lineHeight: 34 },
  greetingName:   { fontFamily: FONTS.serifItalic },
  greetingSub:    { fontFamily: FONTS.sans, fontSize: 12, marginTop: 4 },
  avatar:         { width: 42, height: 42, borderRadius: 21,
                    alignItems: 'center', justifyContent: 'center',
                    borderWidth: 2 },
  partnerWrap:    { paddingHorizontal: SPACING.screenX, marginTop: 20 },
  sectionLabel:   { paddingHorizontal: SPACING.screenX, paddingTop: 24, paddingBottom: 10,
                    fontFamily: FONTS.sansSemiBold, fontSize: 11,
                    letterSpacing: 1.2, textTransform: 'uppercase' },
  cardList:       { paddingHorizontal: SPACING.screenX, gap: SPACING.cardGap },
  empty:          { alignItems: 'center', marginTop: 80, paddingHorizontal: 32 },
  emptyText:      { fontFamily: FONTS.sans, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  emptyRoot:      { flex: 1, justifyContent: 'center',
                    alignItems: 'center', paddingHorizontal: 32 },
  emptyTitle:     { fontFamily: FONTS.serif, fontSize: 24, textAlign: 'center', marginBottom: 8 },
  emptySub:       { fontFamily: FONTS.sans, fontSize: 14, textAlign: 'center', marginBottom: 32 },
  emptyBtn:       { borderRadius: 16, paddingHorizontal: 32, paddingVertical: 14 },
  emptyBtnText:   { fontFamily: FONTS.sansBold, fontSize: 14, color: '#fff' },
  fab:            { position: 'absolute', bottom: 24, right: 24, width: 52, height: 52,
                    borderRadius: 26,
                    alignItems: 'center', justifyContent: 'center' },
})
