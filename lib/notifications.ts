import { Platform } from 'react-native'
import { supabase } from './supabase'

let Notifications: any = null
try {
  Notifications = require('expo-notifications')
  const Device = require('expo-device')

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  })
} catch {}

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Notifications) return null
  try {
    const Device = require('expo-device')
    if (!Device.isDevice) return null

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') return null

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'CareNote',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#E07D8A',
      })
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('profiles')
        .update({ push_token: token })
        .eq('id', user.id)
    }

    return token
  } catch {
    return null
  }
}

export async function setupNotificationCategories() {
  if (!Notifications) return
  try {
    await Notifications.setNotificationCategoryAsync('REMINDER_RESPONSE', [
      {
        identifier: 'done',
        buttonTitle: '✅ Udah!',
        options: { opensAppToForeground: false },
      },
      {
        identifier: 'skip',
        buttonTitle: '😅 Belum',
        options: { opensAppToForeground: false },
      },
    ])
  } catch {}
}
