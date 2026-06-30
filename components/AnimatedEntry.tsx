import { useEffect, type ReactNode } from 'react'
import { useNavigation } from 'expo-router'
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withSequence } from 'react-native-reanimated'
import { useColors } from '../hooks/useColors'

export default function AnimatedEntry({ children }: { children: ReactNode }) {
  const { COLORS } = useColors()
  const navigation = useNavigation()
  const translateY = useSharedValue(20)

  useEffect(() => {
    if (navigation.isFocused()) {
      translateY.value = withSpring(0, { damping: 12, stiffness: 90 })
    }

    const unsub = navigation.addListener('focus', () => {
      translateY.value = withSequence(
        withTiming(14, { duration: 80 }),
        withSpring(0, { damping: 11, stiffness: 110 })
      )
    })
    return unsub
  }, [navigation])

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  return (
    <Animated.View style={[{ flex: 1, backgroundColor: COLORS.rosePale }, animStyle]}>
      {children}
    </Animated.View>
  )
}
