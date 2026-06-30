import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert, Share, Platform, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { usePairStore } from '../../stores/pairStore'
import { FONTS, RADIUS } from '../../constants/theme'
import { useColors } from '../../hooks/useColors'
import RomanticBackground from '../../components/RomanticBackground'

export default function PairScreen() {
  const { COLORS, SHADOW } = useColors()
  const router = useRouter()
  const { createPair, joinPair, pair, subscribePair, fetchPair } = usePairStore()
  const [code, setCode] = useState('')
  const [myCode, setMyCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (pair?.status === 'active') router.replace('/(main)/')
  }, [pair])

  useEffect(() => {
    fetchPair()
    const unsub = subscribePair(() => fetchPair())
    return unsub
  }, [])

  async function handleCreate() {
    setLoading(true)
    try {
      const c = await createPair()
      setMyCode(c)
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin() {
    if (!code.trim()) return Alert.alert('Error', 'Masukkan kode dulu')
    setLoading(true)
    try {
      await joinPair(code)
      router.replace('/(main)/')
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleShare() {
    const text = `Pakai kode ini di CareNote: ${myCode} 💌`
    if (Platform.OS === 'web') {
      try {
        await navigator.clipboard.writeText(text)
      } catch {}
      Alert.alert('Tersalin!', 'Kode pairing udah dicopy ke clipboard')
    } else {
      await Share.share({ message: text })
    }
  }

  return (
    <View style={[s.root, { backgroundColor: COLORS.rosePale }]}>
      <RomanticBackground />
      <Text style={[s.heading, { color: COLORS.ink }]}>Terhubung 💌</Text>
      <Text style={[s.subheading, { color: COLORS.muted }]}>Bagikan kode ke dia, atau masukkan kode dari dia</Text>

      {!myCode ? (
        <TouchableOpacity
          style={[s.createBtn, { backgroundColor: COLORS.ink }, loading && { opacity: 0.7 }]}
          onPress={handleCreate}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={s.createBtnText}>
            {loading ? 'Membuat kode...' : '✨ Buat Kode Pairing'}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[s.codeCard, { backgroundColor: COLORS.ink }]}
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
        style={[s.joinBtn, { backgroundColor: COLORS.roseDark }, SHADOW.button, loading && { opacity: 0.7 }]}
        onPress={handleJoin}
        disabled={loading}
        activeOpacity={0.85}
      >
        <Text style={s.joinBtnText}>
          {loading ? 'Menghubungkan...' : '💞 Hubungkan'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  root:       { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  heading:    { fontFamily: FONTS.serif, fontSize: 36, marginBottom: 8 },
  subheading: { fontFamily: FONTS.sans, fontSize: 14, marginBottom: 40 },
  createBtn:  { borderRadius: RADIUS.lg, paddingVertical: 16,
                alignItems: 'center', marginBottom: 16 },
  createBtnText: { fontFamily: FONTS.sansBold, fontSize: 15, color: '#fff' },
  codeCard:   { borderRadius: RADIUS.lg, padding: 20,
                alignItems: 'center', marginBottom: 16 },
  codeLabel:  { fontFamily: FONTS.sans, fontSize: 11, color: 'rgba(255,255,255,0.6)',
                letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  codeValue:  { fontFamily: FONTS.sansBold, fontSize: 32, color: '#fff',
                letterSpacing: 8 },
  codeHint:   { fontFamily: FONTS.sans, fontSize: 11, color: 'rgba(255,255,255,0.5)',
                marginTop: 4 },
  divider:    { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  dividerLine:{ flex: 1, height: 1 },
  dividerText:{ fontFamily: FONTS.sans, fontSize: 12,
                marginHorizontal: 12 },
  input:      { borderWidth: 1.5,
                borderRadius: RADIUS.md, paddingHorizontal: 16, paddingVertical: 14,
                fontFamily: FONTS.sansBold, fontSize: 16,
                textAlign: 'center', letterSpacing: 4, marginBottom: 12 },
  joinBtn:    { borderRadius: RADIUS.md,
                paddingVertical: 15, alignItems: 'center' },
  joinBtnText:{ fontFamily: FONTS.sansBold, fontSize: 15, color: '#fff' },
})
