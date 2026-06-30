import { useMemo } from 'react'
import { useThemeStore } from '../stores/themeStore'
import { COLORS_LIGHT, COLORS_DARK, FONTS, RADIUS, SHADOW, SPACING } from '../constants/theme'

export function useColors() {
  const theme = useThemeStore(s => s.theme)
  return useMemo(() => ({
    COLORS: theme === 'dark' ? COLORS_DARK : COLORS_LIGHT,
    FONTS,
    RADIUS,
    SHADOW: theme === 'dark'
      ? { ...SHADOW, fab: { ...SHADOW.fab, shadowColor: '#000' }, button: { ...SHADOW.button, shadowColor: '#000' }, card: { ...SHADOW.card, shadowColor: '#000' } }
      : SHADOW,
    SPACING,
    theme,
    isDark: theme === 'dark',
  }), [theme])
}
