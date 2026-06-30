import { useEffect, useState } from 'react'
import { Tabs } from 'expo-router'
import { View, Text, TextInput, TouchableOpacity, Alert, Share, Platform, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated'
import { supabase } from '../../lib/supabase'
import { useColors } from '../../hooks/useColors'
import { usePairStore } from '../../stores/pairStore'
import { useAuthStore } from '../../stores/authStore'
import { FONTS, RADIUS } from '../../constants/theme'
import RomanticBackground from '../../components/RomanticBackground'

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  const opacity = useSharedValue(focused ? 1 : 0.5)

  useEffect(() => {
    opacity.value = withTiming(focused ? 1 : 0.5, { duration: 250, easing: Easing.out(Easing.cubic) })
  }, [focused])

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return (
    <Animated.View style={animStyle}>
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
    </Animated.View>
  )
}

export default function MainLayout() {
  const { COLORS, SHADOW } = useColors()
  const insets = useSafeAreaInsets()
  const { pair, fetchPair, createPair, joinPair, subscribePair } = usePairStore()
  const { profile } = useAuthStore()
  const [code, setCode] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [myCode, setMyCode] = useState<string | null>(null)
  const [pairId, setPairId] = useState<string | null>(null)

  useEffect(() => {
    fetchPair()
    const unsub = subscribePair(() => {
      fetchPair()
      if (pairId) checkActive()
    })
    const poll = setInterval(() => {
      fetchPair()
      if (pairId) checkActive()
    }, 2000)
    return () => { unsub(); clearInterval(poll) }
  }, [])

  useEffect(() => {
    if (pair?.status === 'pending' && pair?.user_a === profile?.id) {
      setMyCode(pair.pair_code)
      setPairId(pair.id)
    }
  }, [pair, profile])

  async function checkActive() {
    if (!pairId) return
    const { data } = await supabase
      .from('pairs')
      .select('status')
      .eq('id', pairId)
      .single()
    if (data?.status === 'active') {
      setMyCode(null)
      setPairId(null)
    }
  }

  async function handleCreate() {
    setCreateLoading(true)
    try {
      const c = await createPair()
      const p = usePairStore.getState().pair
      if (p) setPairId(p.id)
      setMyCode(c)
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setCreateLoading(false)
    }
  }

  async function handleJoin() {
    if (!code.trim()) return Alert.alert('Error', 'Masukkan kode dulu')
    setJoinLoading(true)
    try {
      await joinPair(code)
      setMyCode(null)
      setPairId(null)
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setJoinLoading(false)
    }
  }

  async function handleShare() {
    const text = `Pakai kode ini di CareNote: ${myCode} 💌`
    if (Platform.OS === 'web') {
      try { await navigator.clipboard.writeText(text) } catch {}
      Alert.alert('Tersalin!', 'Kode pairing udah dicopy ke clipboard')
    } else {
      await Share.share({ message: text })
    }
  }

  if (!pair || pair.status === 'pending') {
    return (
      <View style={[s.unpairedRoot, { backgroundColor: COLORS.rosePale }]}>
        <RomanticBackground />
        <Text style={[s.heading, { color: COLORS.ink }]}>Terhubung 💌</Text>
        <Text style={[s.subheading, { color: COLORS.muted }]}>Bagikan kode ke dia, atau masukkan kode dari dia</Text>

        {!myCode ? (
          <TouchableOpacity
            style={[s.createBtn, { backgroundColor: '#1C1018' }, createLoading && { opacity: 0.7 }]}
            onPress={handleCreate}
            disabled={createLoading}
            activeOpacity={0.85}
          >
            <Text style={s.createBtnText}>
              {createLoading ? 'Membuat kode...' : '✨ Buat Kode Pairing'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[s.codeCard, { backgroundColor: '#1C1018' }]}
            onPress={handleShare}
            activeOpacity={0.85}
          >
            <Text style={s.codeLabel}>Kode kamu</Text>
            <Text style={s.codeValue}>{myCode}</Text>
            <Text style={s.codeHint}>Tap untuk bagikan</Text>
          </TouchableOpacity>
        )}

        <View style={s.divider}>
          <View style={[s.dividerLine, { backgroundColor: COLORS.line }]} />
          <Text style={[s.dividerText, { color: COLORS.muted }]}>atau</Text>
          <View style={[s.dividerLine, { backgroundColor: COLORS.line }]} />
        </View>

        <TextInput
          style={[s.input, { backgroundColor: COLORS.white, borderColor: COLORS.line, color: COLORS.ink }]}
          placeholder="Masukkan kode dia"
          placeholderTextColor={COLORS.muted}
          value={code}
          onChangeText={t => setCode(t.toUpperCase())}
          maxLength={6}
          autoCapitalize="characters"
        />
        <TouchableOpacity
          style={[s.joinBtn, { backgroundColor: COLORS.roseDark }, SHADOW.button, joinLoading && { opacity: 0.7 }]}
          onPress={handleJoin}
          disabled={joinLoading}
          activeOpacity={0.85}
        >
          <Text style={s.joinBtnText}>
            {joinLoading ? 'Menghubungkan...' : '💞 Hubungkan'}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <Tabs
      screenOptions={{
        lazy: false,
        headerShown: false,
        tabBarStyle: {
          borderTopColor: COLORS.line,
          backgroundColor: COLORS.white,
          paddingBottom: insets.bottom + 8,
          height: insets.bottom + 60,
        },
        tabBarActiveTintColor: COLORS.roseDark,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarLabelStyle: { fontSize: 10, fontFamily: 'DMSans_600SemiBold' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Buat',
          tabBarIcon: ({ focused }) => <TabIcon emoji="➕" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Riwayat',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          title: 'Galeri',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🖼" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Setelan',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="pair"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="notif"
        options={{
          href: null,
        }}
      />
    </Tabs>
  )
}

const s = StyleSheet.create({
  unpairedRoot: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
  heading:      { fontFamily: FONTS.serif, fontSize: 28 },
  subheading:   { fontFamily: FONTS.sans, fontSize: 14, textAlign: 'center', marginBottom: 4 },
  createBtn:    { borderRadius: RADIUS.lg, paddingVertical: 14, paddingHorizontal: 32 },
  createBtnText: { fontFamily: FONTS.sansBold, fontSize: 15, color: '#fff' },
  codeCard:     { borderRadius: RADIUS.lg, paddingVertical: 20, paddingHorizontal: 40, alignItems: 'center', gap: 4 },
  codeLabel:    { fontFamily: FONTS.sans, fontSize: 13, color: '#fff9' },
  codeValue:    { fontFamily: FONTS.serif, fontSize: 36, letterSpacing: 6, color: '#fff' },
  codeHint:     { fontFamily: FONTS.sans, fontSize: 11, color: '#fff6' },
  divider:      { flexDirection: 'row', alignItems: 'center', width: '100%', gap: 12 },
  dividerLine:  { flex: 1, height: 1 },
  dividerText:  { fontFamily: FONTS.sans, fontSize: 13 },
  input:        { width: '100%', borderRadius: RADIUS.lg, borderWidth: 1, padding: 14, fontFamily: FONTS.sans, fontSize: 18, textAlign: 'center', letterSpacing: 4 },
  joinBtn:      { width: '100%', borderRadius: RADIUS.lg, paddingVertical: 14, alignItems: 'center' },
  joinBtnText:  { fontFamily: FONTS.sansBold, fontSize: 15, color: '#fff' },
})
