import { useEffect } from 'react'
import { Slot, useRouter, useSegments } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { useReminderStore } from '../stores/reminderStore'
import { registerForPushNotifications, setupNotificationCategories } from '../lib/notifications'
import TimePickerModal from '../components/TimePickerModal'
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans'
import {
  DMSerifDisplay_400Regular,
  DMSerifDisplay_400Regular_Italic,
} from '@expo-google-fonts/dm-serif-display'
import * as SplashScreen from 'expo-splash-screen'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const router = useRouter()
  const segments = useSegments()
  const { user, profile, fetchProfile } = useAuthStore()

  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    DMSerifDisplay_400Regular,
    DMSerifDisplay_400Regular_Italic,
  })

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  useEffect(() => {
    fetchProfile()

    const interval = setInterval(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.id) {
        await supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', user.id)
      }
    }, 10000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          fetchProfile().catch(() => {})
          registerForPushNotifications().catch(() => {})
          setupNotificationCategories().catch(() => {})
        }
      }
    )

    return () => { subscription.unsubscribe(); clearInterval(interval) }
  }, [])

  useEffect(() => {
    if (!fontsLoaded) return

    const inAuth = segments[0] === '(auth)'
    if (!user && !inAuth) router.replace('/(auth)/login')
    if (user && profile && inAuth) router.replace('/(main)/')
  }, [user, profile, segments, fontsLoaded])

  useEffect(() => {
    let sub: any = { remove: () => {} }
    try {
      const Notifications = require('expo-notifications')
      sub = Notifications.addNotificationResponseReceivedListener(async (response: any) => {
        const { actionIdentifier, notification } = response
        const data = notification.request.content.data as Record<string, any> | undefined
        const reminderId: string | undefined = data?.reminder_id

        if (reminderId && (actionIdentifier === 'done' || actionIdentifier === 'skip')) {
          await useReminderStore.getState().confirm(reminderId, actionIdentifier as 'done' | 'skip')
        }
      })
    } catch {}

    return () => sub.remove()
  }, [])

  if (!fontsLoaded) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Slot />
      <TimePickerModal />
    </GestureHandlerRootView>
  )
}
