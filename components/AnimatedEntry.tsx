import { useEffect, type ReactNode } from 'react'
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated'

const SPRING = { damping: 10, stiffness: 80, mass: 0.7 }

export default function AnimatedEntry({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(40)
  const scale = useSharedValue(0.92)

  useEffect(() => {
    opacity.value = withDelay(delay, withSpring(1, SPRING))
    translateY.value = withDelay(delay, withSpring(0, SPRING))
    scale.value = withDelay(delay, withSpring(1, SPRING))
  }, [])

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }))

  return <Animated.View style={[{ flex: 1 }, animStyle]}>{children}</Animated.View>
}
