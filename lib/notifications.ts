import { Platform } from 'react-native'
import { supabase } from './supabase'

const PROJECT_ID = '74d57ae6-8162-4d1f-9d74-088a2fc1df8f'

function tryLoadNotifications() {
  try {
    const Notifications = require('expo-notifications')
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    })
    return Notifications
  } catch {
    return null
  }
}

export async function registerForPushNotifications(): Promise<string | null> {
  const Notifications = tryLoadNotifications()
  if (!Notifications) return null

  try {
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

    let token: string | null = null
    try {
      const r = await Notifications.getExpoPushTokenAsync({ projectId: PROJECT_ID })
      token = r.data
    } catch {
      try {
        const r = await Notifications.getExpoPushTokenAsync({ experienceId: '@nomssky/carenote' })
        token = r.data
      } catch {
        try {
          const r = await Notifications.getExpoPushTokenAsync()
          token = r.data
        } catch {}
      }
    }

    if (!token) return null

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
  const Notifications = tryLoadNotifications()
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
