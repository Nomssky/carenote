import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Alert, Platform, Image, StyleSheet } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../lib/supabase'
import type { ReminderWithConfirmation } from '../types'
import { useReminderStore } from '../stores/reminderStore'
import { formatTime } from '../lib/utils'
import { REMINDER_PRESETS } from '../constants/reminders'
import { FONTS } from '../constants/theme'
import { useColors } from '../hooks/useColors'
import Animated, { useSharedValue, withTiming, useAnimatedStyle, withDelay } from 'react-native-reanimated'

type Props = { reminder: ReminderWithConfirmation; isOwn: boolean; index?: number }

export default function ReminderCard({ reminder, isOwn, index }: Props) {
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(30)

  useEffect(() => {
    const delay = (index ?? 0) * 80
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }))
    translateY.value = withDelay(delay, withTiming(0, { duration: 400 }))
  }, [])

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }))
  const { COLORS } = useColors()
  const { confirm, deleteReminder } = useReminderStore()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)
  const preset = REMINDER_PRESETS.find(p => p.type === reminder.type)
  const isDone = reminder.confirmation?.status === 'done'
  const isSkip = reminder.confirmation?.status === 'skip'
  const confirmed = isDone || isSkip

  function handleDelete() {
    const exec = () => {
      setDeleting(true)
      deleteReminder(reminder.id).catch(e => Alert.alert('Error', e.message)).finally(() => setDeleting(false))
    }

    if (Platform.OS === 'web') {
      if (window.confirm('Hapus reminder ini?')) exec()
    } else {
      Alert.alert('Hapus Reminder', 'Yakin mau hapus?', [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: exec },
      ])
    }
  }

  async function pickPhoto() {
    if (Platform.OS === 'web') {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.capture = 'environment'
      input.onchange = async () => {
        const file = input.files?.[0]
        if (!file) return
        await uploadAndConfirm(file)
      }
      input.click()
    } else {
      try {
        const { granted } = await ImagePicker.requestCameraPermissionsAsync()
        if (!granted) {
          Alert.alert('Izin Ditolak', 'Aktifkan akses kamera di pengaturan HP untuk mengirim bukti foto.')
          return
        }
        const result = await ImagePicker.launchCameraAsync({
          quality: 0.7,
          allowsEditing: true,
        })
        if (result.canceled) return

        const uri = result.assets[0].uri
        const response = await fetch(uri)
        const blob = await response.blob()
        await uploadAndConfirm(blob)
      } catch (e: any) {
        Alert.alert('Error', e.message)
      }
    }
  }

  async function uploadAndConfirm(file: File | Blob) {
    setLoading(true)
    try {
      const ext = (file instanceof File ? file.name : 'jpg').split('.').pop() || 'jpg'
      const path = `proofs/${reminder.id}_${Date.now()}.${ext}`
      const contentType = file.type || 'image/jpeg'

      const { error: uploadErr } = await supabase.storage
        .from('proofs')
        .upload(path, file, { contentType })

      if (uploadErr) throw uploadErr

      const { data: urlData } = supabase.storage.from('proofs').getPublicUrl(path)
      const photoUrl = urlData.publicUrl

      setPhoto(photoUrl)
      await confirm(reminder.id, 'done', undefined, photoUrl)
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Animated.View style={[s.card, { backgroundColor: COLORS.white, borderColor: COLORS.line }, (confirmed || deleting) && { opacity: 0.65 }, animStyle]}>
      <View style={[s.iconBox, { backgroundColor: preset?.color ?? COLORS.blush }]}>
        <Text style={{ fontSize: 20 }}>{reminder.emoji}</Text>
      </View>

      <View style={s.info}>
        <Text style={[s.cardTitle, { color: COLORS.ink }]} numberOfLines={1}>
          {preset?.label ?? reminder.type}
        </Text>
        <Text style={[s.cardMsg, { color: COLORS.muted }]} numberOfLines={1}>{reminder.message}</Text>
        <Text style={[s.cardTime, { color: COLORS.roseDark }]}>{formatTime(reminder.remind_time)}</Text>
        {photo && <Image source={{ uri: photo }} style={s.photoPreview} />}
        {reminder.confirmation?.photo_url && !photo && (
          <Image source={{ uri: reminder.confirmation.photo_url }} style={s.photoPreview} />
        )}
      </View>

      {isOwn ? (
        <TouchableOpacity onPress={handleDelete} disabled={deleting} style={[s.deleteBtn, { backgroundColor: COLORS.blush }]}>
          <Text style={{ fontSize: 20 }}>
            {isDone ? '💚' : isSkip ? '⏳' : '⏰'}
          </Text>
          <Text style={{ fontSize: 20, lineHeight: 20, color: COLORS.roseDark }}>×</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[s.cameraBtn, { backgroundColor: COLORS.blush }, loading && { opacity: 0.5 }]}
          onPress={pickPhoto}
          disabled={loading || confirmed}
        >
          <Text style={{ fontSize: 20 }}>{confirmed ? '✅' : '📸'}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  )
}

const s = StyleSheet.create({
  card:          { borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
                   flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconBox:       { width: 40, height: 40, borderRadius: 12,
                   alignItems: 'center', justifyContent: 'center' },
  info:          { flex: 1 },
  cardTitle:     { fontFamily: FONTS.sansBold, fontSize: 14 },
  cardMsg:       { fontFamily: FONTS.sans, fontSize: 12, marginTop: 2 },
  cardTime:      { fontFamily: FONTS.sansBold, fontSize: 11, marginTop: 2 },
  cameraBtn:     { width: 44, height: 44, borderRadius: 22,
                   alignItems: 'center', justifyContent: 'center' },
  photoPreview:  { width: '100%', height: 120, borderRadius: 12, marginTop: 8,
                   resizeMode: 'cover' },
  deleteBtn:     { alignItems: 'center', justifyContent: 'center',
                   width: 40, height: 40, borderRadius: 20 },
})
