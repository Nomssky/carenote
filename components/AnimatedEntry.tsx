import { useCallback, type ReactNode } from 'react'
import { useFocusEffect } from 'expo-router'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, Easing } from 'react-native-reanimated'

const EASE = Easing.out(Easing.cubic)

export default function AnimatedEntry({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(12)

  useFocusEffect(
    useCallback(() => {
      opacity.value = withSequence(
        withTiming(0, { duration: 60 }),
        withTiming(1, { duration: 300, easing: EASE })
      )
      translateY.value = withSequence(
        withTiming(12, { duration: 60 }),
        withTiming(0, { duration: 300, easing: EASE })
      )
    }, [])
  )

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }))

  return <Animated.View style={[{ flex: 1 }, animStyle]}>{children}</Animated.View>
}
