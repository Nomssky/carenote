import { create } from 'zustand'
import { Platform } from 'react-native'

type Theme = 'light' | 'dark'

type ThemeStore = {
  theme: Theme
  toggle: () => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: 'light',
  toggle: () => set(s => {
    const next = s.theme === 'light' ? 'dark' : 'light'
    saveTheme(next)
    return { theme: next }
  }),
}))

function saveTheme(t: Theme) {
  if (Platform.OS === 'web') {
    try { localStorage.setItem('carenote-theme', t) } catch {}
  } else {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default
      AsyncStorage.setItem('carenote-theme', t)
    } catch {}
  }
}

function loadTheme(): Theme {
  if (Platform.OS === 'web') {
    try {
      const v = localStorage.getItem('carenote-theme')
      if (v === 'dark' || v === 'light') return v
    } catch {}
  } else {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default
      AsyncStorage.getItem('carenote-theme').then((v: string | null) => {
        if (v === 'dark' || v === 'light') useThemeStore.setState({ theme: v })
      })
    } catch {}
  }
  return 'light'
}

const initial = loadTheme()
if (initial !== 'light') useThemeStore.setState({ theme: initial })
