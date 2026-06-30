import { useEffect, type ReactNode } from 'react'
import { useNavigation } from 'expo-router'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated'
import { useColors } from '../hooks/useColors'

const EASE = Easing.out(Easing.cubic)

export default function AnimatedEntry({ children }: { children: ReactNode }) {
  const { COLORS } = useColors()
  const navigation = useNavigation()
  const scale = useSharedValue(0.97)

  useEffect(() => {
    if (navigation.isFocused()) {
      scale.value = withTiming(1, { duration: 250, easing: EASE })
    }

    const unsub = navigation.addListener('focus', () => {
      scale.value = 0.99
      scale.value = withTiming(1, { duration: 180, easing: EASE })
    })
    return unsub
  }, [navigation])

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View style={[{ flex: 1, backgroundColor: COLORS.rosePale }, animStyle]}>
      {children}
    </Animated.View>
  )
}
