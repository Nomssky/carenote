import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert, Modal, Platform, StyleSheet } from 'react-native'
import { useAuthStore } from '../../stores/authStore'
import { usePairStore } from '../../stores/pairStore'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'expo-router'
import { FONTS, SPACING, RADIUS } from '../../constants/theme'
import { useColors } from '../../hooks/useColors'
import AnimatedEntry from '../../components/AnimatedEntry'
import RomanticBackground from '../../components/RomanticBackground'
import { useThemeStore } from '../../stores/themeStore'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function SettingsScreen() {
  const { COLORS } = useColors()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { profile, signOut } = useAuthStore()
  const { partner, pair, disconnectPair } = usePairStore()
  const { theme, toggle: toggleTheme } = useThemeStore()
  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSignOut() {
    Alert.alert('Keluar', 'Yakin mau keluar?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: async () => {
        await signOut()
        router.replace('/(auth)/login')
      }},
    ])
  }

  function openEdit() {
    setEditName(profile?.name ?? '')
    setEditOpen(true)
  }

  async function saveName() {
    if (!editName.trim()) return Alert.alert('Error', 'Nama harus diisi')
    setSaving(true)
    const { error } = await supabase.from('profiles').update({ name: editName.trim() }).eq('id', profile!.id)
    setSaving(false)
    if (error) return Alert.alert('Error', error.message)
    setEditOpen(false)
  }

  async function handleDisconnect() {
    if (!pair) return

    const ok = Platform.OS === 'web'
      ? window.confirm('Yakin mau putus dari pasangan? Semua data reminder akan tetap ada.')
      : await new Promise<boolean>(resolve => {
          Alert.alert('Putus', 'Yakin mau putus dari pasangan? Semua data reminder akan tetap ada.', [
            { text: 'Batal', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Putus', style: 'destructive', onPress: () => resolve(true) },
          ])
        })

    if (!ok) return

    try {
      await disconnectPair()
    } catch (e: any) {
      Alert.alert('Error', e.message)
    }
  }

  return (
    <AnimatedEntry>
      <View style={[s.root, { backgroundColor: COLORS.rosePale }]}>
        <RomanticBackground />
        <View style={[s.header, { paddingTop: insets.top + 32 }]}>
          <Text style={[s.title, { color: COLORS.ink }]}>Setelan</Text>
        </View>

        <View style={s.section}>
          <Text style={[s.sectionLabel, { color: COLORS.muted }]}>Profil</Text>
          <TouchableOpacity style={[s.card, { backgroundColor: COLORS.white, borderColor: COLORS.line }]} onPress={openEdit} activeOpacity={0.7}>
            <Text style={[s.cardLabel, { color: COLORS.muted }]}>Nama</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[s.cardValue, { color: COLORS.ink }]}>{profile?.name ?? '-'}</Text>
              <Text style={{ color: COLORS.muted, fontSize: 14 }}>✎</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={s.section}>
          <Text style={[s.sectionLabel, { color: COLORS.muted }]}>Tampilan</Text>
          <TouchableOpacity
            style={[s.card, { backgroundColor: COLORS.white, borderColor: COLORS.line, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <Text style={[s.cardLabel, { color: COLORS.muted }]}>Mode Gelap</Text>
            <View style={{
              width: 48, height: 28, borderRadius: 14,
              backgroundColor: theme === 'dark' ? COLORS.roseDark : COLORS.line,
              justifyContent: 'center', paddingHorizontal: 3,
            }}>
              <View style={{
                width: 22, height: 22, borderRadius: 11,
                backgroundColor: COLORS.white,
                alignSelf: theme === 'dark' ? 'flex-end' : 'flex-start',
              }} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={s.section}>
          <Text style={[s.sectionLabel, { color: COLORS.muted }]}>Pasangan</Text>
          <View style={[s.card, { backgroundColor: COLORS.white, borderColor: COLORS.line }]}>
            <Text style={[s.cardLabel, { color: COLORS.muted }]}>Nama</Text>
            <Text style={[s.cardValue, { color: COLORS.ink }]}>{partner?.name ?? '-'}</Text>
          </View>
          {pair && (
            <>
              <View style={[s.card, { backgroundColor: COLORS.white, borderColor: COLORS.line }]}>
                <Text style={[s.cardLabel, { color: COLORS.muted }]}>Kode Pairing</Text>
                <Text style={[s.cardValue, { color: COLORS.ink }]}>{pair.pair_code}</Text>
              </View>
              <TouchableOpacity style={[s.dangerBtn, { borderColor: COLORS.roseDark }]} onPress={handleDisconnect}>
                <Text style={[s.dangerBtnText, { color: COLORS.roseDark }]}>Putus dari Pasangan</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <Modal visible={editOpen} transparent animationType="fade">
          <View style={s.modalOverlay}>
            <View style={[s.modalBox, { backgroundColor: COLORS.white }]}>
              <Text style={[s.modalTitle, { color: COLORS.ink }]}>Edit Nama</Text>
              <TextInput
                style={[s.modalInput, { backgroundColor: COLORS.white, borderColor: COLORS.line, color: COLORS.ink }]}
                value={editName}
                onChangeText={setEditName}
                placeholder="Nama kamu"
                placeholderTextColor={COLORS.muted}
                autoFocus
              />
              <View style={s.modalRow}>
                <TouchableOpacity style={[s.modalCancel, { borderColor: COLORS.line }]} onPress={() => setEditOpen(false)}>
                  <Text style={[s.modalCancelText, { color: COLORS.muted }]}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.modalSave, { backgroundColor: COLORS.roseDark }, saving && { opacity: 0.7 }]} onPress={saveName} disabled={saving}>
                  <Text style={s.modalSaveText}>{saving ? 'Menyimpan...' : 'Simpan'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <View style={{ flex: 1 }} />
        <TouchableOpacity style={[s.logoutBtn, { borderColor: COLORS.roseDark }]} onPress={handleSignOut}>
          <Text style={[s.logoutText, { color: COLORS.roseDark }]}>Keluar</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </View>
    </AnimatedEntry>
  )
}

const s = StyleSheet.create({
  root:         { flex: 1 },
  header:       { paddingHorizontal: SPACING.screenX, paddingBottom: 8 },
  title:        { fontFamily: FONTS.serif, fontSize: 28 },
  section:      { paddingHorizontal: SPACING.screenX, marginTop: 24 },
  sectionLabel: { fontFamily: FONTS.sansSemiBold, fontSize: 11,
                  letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 },
  card:         { borderWidth: 1.5,
                  borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 8 },
  cardLabel:    { fontFamily: FONTS.sans, fontSize: 12 },
  cardValue:    { fontFamily: FONTS.sansBold, fontSize: 14, marginTop: 2 },
  dangerBtn:    { borderRadius: 16, borderWidth: 1.5,
                  paddingVertical: 12, alignItems: 'center', marginBottom: 8 },
  dangerBtnText:{ fontFamily: FONTS.sansBold, fontSize: 13 },
  logoutBtn:    { marginHorizontal: SPACING.screenX, borderRadius: 16, borderWidth: 1.5,
                  paddingVertical: 14, alignItems: 'center' },
  logoutText:   { fontFamily: FONTS.sansBold, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center',
                  paddingHorizontal: 32 },
  modalBox:     { borderRadius: 20, padding: 24 },
  modalTitle:   { fontFamily: FONTS.serif, fontSize: 22, marginBottom: 16 },
  modalInput:   { borderWidth: 1.5,
                  borderRadius: RADIUS.md, paddingHorizontal: 16, paddingVertical: 14,
                  fontFamily: FONTS.sans, fontSize: 14, marginBottom: 16 },
  modalRow:     { flexDirection: 'row', gap: 12 },
  modalCancel:  { flex: 1, borderRadius: RADIUS.md, borderWidth: 1.5,
                  paddingVertical: 14, alignItems: 'center' },
  modalCancelText:{ fontFamily: FONTS.sansBold, fontSize: 14 },
  modalSave:    { flex: 1, borderRadius: RADIUS.md,
                  paddingVertical: 14, alignItems: 'center' },
  modalSaveText:{ fontFamily: FONTS.sansBold, fontSize: 14, color: '#fff' },
})
