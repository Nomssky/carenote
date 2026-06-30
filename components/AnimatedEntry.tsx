import { type ReactNode } from 'react'
import { View } from 'react-native'
import { useColors } from '../hooks/useColors'

export default function AnimatedEntry({ children }: { children: ReactNode }) {
  const { COLORS } = useColors()
  return <View style={{ flex: 1, backgroundColor: COLORS.rosePale }}>{children}</View>
}
