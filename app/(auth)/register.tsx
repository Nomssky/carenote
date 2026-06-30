import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { FONTS, RADIUS } from '../../constants/theme'
import { useColors } from '../../hooks/useColors'
import RomanticBackground from '../../components/RomanticBackground'

export default function RegisterScreen() {
  const { COLORS, SHADOW } = useColors()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    if (!name.trim()) return Alert.alert('Error', 'Nama harus diisi')
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) { setLoading(false); return Alert.alert('Error', error.message) }
      if (!data.user) { setLoading(false); return Alert.alert('Error', 'Gagal membuat akun. Coba lagi.') }

      const { error: profileErr } = await supabase.from('profiles').insert({
        id: data.user.id,
        name: name.trim(),
      })

      if (profileErr) { setLoading(false); return Alert.alert('Error', profileErr.message) }

      setLoading(false)
      router.replace('/(main)/pair')
    } catch (e: any) {
      setLoading(false)
      Alert.alert('Error', e.message)
    }
  }

  return (
    <KeyboardAvoidingView
      style={[s.root, { backgroundColor: COLORS.rosePale }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <RomanticBackground />
      <View style={s.container}>
        <Text style={[s.heading, { color: COLORS.ink }]}>Daftar 🌸</Text>
        <Text style={[s.subheading, { color: COLORS.muted }]}>Buat akun baru untuk mulai</Text>

        <TextInput
          style={[s.input, { backgroundColor: COLORS.white, borderColor: COLORS.line, color: COLORS.ink }]}
          placeholder="Nama kamu"
          placeholderTextColor={COLORS.muted}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[s.input, { backgroundColor: COLORS.white, borderColor: COLORS.line, color: COLORS.ink }]}
          placeholder="Email"
          placeholderTextColor={COLORS.muted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={[s.input, { backgroundColor: COLORS.white, borderColor: COLORS.line, color: COLORS.ink }]}
          placeholder="Password"
          placeholderTextColor={COLORS.muted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[s.button, { backgroundColor: COLORS.roseDark }, SHADOW.button, loading && { opacity: 0.7 }]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={s.buttonText}>
            {loading ? 'Mendaftar...' : 'Daftar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.linkWrap}
          onPress={() => router.back()}
        >
          <Text style={[s.linkText, { color: COLORS.muted }]}>
            Sudah punya akun? <Text style={[s.linkBold, { color: COLORS.roseDark }]}>Masuk</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  root:       { flex: 1 },
  container:  { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  heading:    { fontFamily: FONTS.serif, fontSize: 36, marginBottom: 8 },
  subheading: { fontFamily: FONTS.sans, fontSize: 14, marginBottom: 40 },
  input:      { borderWidth: 1.5,
                borderRadius: RADIUS.md, paddingHorizontal: 16, paddingVertical: 14,
                fontFamily: FONTS.sans, fontSize: 14,
                marginBottom: 12 },
  button:     { borderRadius: RADIUS.md,
                paddingVertical: 15, alignItems: 'center',
                marginBottom: 16 },
  buttonText: { fontFamily: FONTS.sansBold, fontSize: 15, color: '#fff' },
  linkWrap:   { alignItems: 'center' },
  linkText:   { fontFamily: FONTS.sans, fontSize: 14 },
  linkBold:   { fontFamily: FONTS.sansBold },
})
