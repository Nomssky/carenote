import { useEffect, type ReactNode } from 'react'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from 'react-native-reanimated'

const EASE = { duration: 350, easing: Easing.out(Easing.cubic) }

export default function AnimatedEntry({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(24)

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, EASE))
    translateY.value = withDelay(delay, withTiming(0, EASE))
  }, [])

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }))

  return <Animated.View style={[{ flex: 1 }, animStyle]}>{children}</Animated.View>
}
