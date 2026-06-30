import { useEffect, type ReactNode } from 'react'
import { useNavigation } from 'expo-router'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, Easing } from 'react-native-reanimated'

const EASE = Easing.out(Easing.cubic)

export default function AnimatedEntry({ children }: { children: ReactNode }) {
  const navigation = useNavigation()
  const translateY = useSharedValue(16)

  useEffect(() => {
    if (navigation.isFocused()) {
      translateY.value = withTiming(0, { duration: 300, easing: EASE })
    }

    const unsub = navigation.addListener('focus', () => {
      translateY.value = withSequence(
        withTiming(12, { duration: 80 }),
        withTiming(0, { duration: 280, easing: EASE })
      )
    })
    return unsub
  }, [navigation])

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  return <Animated.View style={[{ flex: 1 }, animStyle]}>{children}</Animated.View>
}
