import { useEffect, type ReactNode } from 'react'
import { View } from 'react-native'
import { useNavigation } from 'expo-router'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, Easing } from 'react-native-reanimated'
import { useColors } from '../hooks/useColors'
import { useTabStore } from '../stores/tabStore'

const EASE = Easing.out(Easing.cubic)
const DUR = 500

export default function AnimatedEntry({ children }: { children: ReactNode }) {
  const { COLORS } = useColors()
  const navigation = useNavigation()
  const translateX = useSharedValue(60)

  useEffect(() => {
    if (navigation.isFocused()) {
      translateX.value = withTiming(0, { duration: DUR, easing: EASE })
    }

    const unsub = navigation.addListener('focus', () => {
      const from = useTabStore.getState().dir === 'right' ? 60 : -60
      translateX.value = withSequence(
        withTiming(from, { duration: 40 }),
        withTiming(0, { duration: DUR, easing: EASE })
      )
    })
    return unsub
  }, [navigation])

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.rosePale }}>
      <Animated.View style={[{ flex: 1 }, animStyle]}>
        {children}
      </Animated.View>
    </View>
  )
}
