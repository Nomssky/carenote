import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { FONTS, RADIUS } from '../../constants/theme'
import { useColors } from '../../hooks/useColors'
import RomanticBackground from '../../components/RomanticBackground'

export default function LoginScreen() {
  const { COLORS, SHADOW } = useColors()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) Alert.alert('Error', error.message)
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={[s.root, { backgroundColor: COLORS.rosePale }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <RomanticBackground />
      <View style={s.container}>
        <Text style={[s.heading, { color: COLORS.ink }]}>Halo 👋</Text>
        <Text style={[s.subheading, { color: COLORS.muted }]}>Masuk untuk terhubung dengan dia</Text>

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
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={s.buttonText}>
            {loading ? 'Masuk...' : 'Masuk'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.linkWrap}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={[s.linkText, { color: COLORS.muted }]}>
            Belum punya akun? <Text style={[s.linkBold, { color: COLORS.roseDark }]}>Daftar</Text>
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
