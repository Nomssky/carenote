import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Image, RefreshControl, StyleSheet } from 'react-native'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { usePairStore } from '../../stores/pairStore'
import { FONTS, SPACING } from '../../constants/theme'
import { useColors } from '../../hooks/useColors'
import RomanticBackground from '../../components/RomanticBackground'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function GalleryScreen() {
  const { COLORS } = useColors()
  const insets = useSafeAreaInsets()
  const { profile } = useAuthStore()
  const { pair } = usePairStore()
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!pair || !profile) return
    fetchPhotos()
  }, [pair, profile])

  async function fetchPhotos() {
    if (!pair) return
    const { data } = await supabase
      .from('confirmations')
      .select(`*, reminder:reminders(*)`)
      .eq('user_id', profile?.id)
      .not('photo_url', 'is', null)
      .order('responded_at', { ascending: false })

    setPhotos(data ?? [])
    setLoading(false)
  }

  return (
    <View style={[s.root, { backgroundColor: COLORS.rosePale }]}>
      <RomanticBackground />
      <View style={[s.header, { paddingTop: insets.top + 32 }]}>
        <Text style={[s.title, { color: COLORS.ink }]}>Galeri Bukti</Text>
        <Text style={[s.sub, { color: COLORS.muted }]}>Foto yang kamu kirim sebagai bukti</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchPhotos} tintColor={COLORS.roseDark} />
        }
      >
        <View style={s.grid}>
          {photos.map(item => (
            <View key={item.id} style={[s.item, { backgroundColor: COLORS.white, borderColor: COLORS.line }]}>
              <Image source={{ uri: item.photo_url }} style={s.image} />
              <Text style={[s.label, { color: COLORS.ink }]} numberOfLines={1}>{item.reminder?.emoji} {item.reminder?.type}</Text>
            </View>
          ))}
          {photos.length === 0 && !loading && (
            <View style={s.empty}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>📸</Text>
              <Text style={[s.emptyText, { color: COLORS.muted }]}>Belum ada foto bukti</Text>
            </View>
          )}
        </View>
        <View style={{ height: 96 }} />
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  root:     { flex: 1 },
  header:   { paddingHorizontal: SPACING.screenX, paddingBottom: 8 },
  title:    { fontFamily: FONTS.serif, fontSize: 28 },
  sub:      { fontFamily: FONTS.sans, fontSize: 12, marginTop: 4 },
  grid:     { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.screenX, paddingTop: 20, gap: 12 },
  item:     { width: '47%', borderWidth: 1.5,
              borderRadius: 16, overflow: 'hidden' },
  image:    { width: '100%', height: 150 },
  label:    { fontFamily: FONTS.sansBold, fontSize: 12, padding: 8 },
  empty:    { alignItems: 'center', marginTop: 80, width: '100%' },
  emptyText:{ fontFamily: FONTS.sans, fontSize: 14 },
})
