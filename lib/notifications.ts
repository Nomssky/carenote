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

async function debug(step: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ notif_debug: step }).eq('id', user.id)
    }
  } catch {}
}

export async function registerForPushNotifications(): Promise<string | null> {
  await debug('start')

  const Notifications = tryLoadNotifications()
  if (!Notifications) { await debug('no_notif_module'); return null }
  await debug('module_loaded')

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { await debug('no_user'); return null }
    await debug('user_ok')

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    await debug('perm_check:' + existingStatus)
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
      await debug('perm_requested:' + status)
    }

    if (finalStatus !== 'granted') { await debug('perm_denied'); return null }
    await debug('perm_granted')

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'CareNote',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#E07D8A',
      })
      await debug('channel_ok')
    }

    let token: string | null = null
    let tokenMethod = ''

    try {
      const r = await Notifications.getExpoPushTokenAsync({ projectId: PROJECT_ID })
      token = r.data
      tokenMethod = 'projectId'
    } catch (e: any) {
      await debug('token_fail_projectId:' + (e?.message ?? 'unknown'))
      try {
        const r = await Notifications.getExpoPushTokenAsync({ experienceId: '@nomssky/carenote' })
        token = r.data
        tokenMethod = 'experienceId'
      } catch (e2: any) {
        await debug('token_fail_experienceId:' + (e2?.message ?? 'unknown'))
        try {
          const r = await Notifications.getExpoPushTokenAsync()
          token = r.data
          tokenMethod = 'none'
        } catch (e3: any) {
          await debug('token_fail_none:' + (e3?.message ?? 'unknown'))
        }
      }
    }

    if (!token) { await debug('no_token'); return null }
    await debug('token_ok:' + tokenMethod)

    const { error } = await supabase
      .from('profiles')
      .update({ push_token: token, notif_debug: 'saved' })
      .eq('id', user.id)

    if (error) await debug('save_err:' + error.message)
    else await debug('saved')

    return token
  } catch (e: any) {
    await debug('catch:' + (e?.message ?? 'unknown'))
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
