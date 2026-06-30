import { useEffect, type ReactNode } from 'react'
import { View } from 'react-native'
import { useNavigation } from 'expo-router'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated'
import { useColors } from '../hooks/useColors'
import { useTabStore } from '../stores/tabStore'

const EASE = Easing.out(Easing.cubic)

export default function AnimatedEntry({ children }: { children: ReactNode }) {
  const { COLORS } = useColors()
  const navigation = useNavigation()
  const translateX = useSharedValue(0)

  useEffect(() => {
    if (navigation.isFocused()) {
      const from = useTabStore.getState().dir === 'right' ? 60 : -60
      translateX.value = from
      translateX.value = withTiming(0, { duration: 220, easing: EASE })
    }

    const unsub = navigation.addListener('focus', () => {
      const from = useTabStore.getState().dir === 'right' ? 60 : -60
      translateX.value = from
      translateX.value = withTiming(0, { duration: 200, easing: EASE })
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
