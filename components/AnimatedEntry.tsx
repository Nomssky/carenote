import { useEffect, type ReactNode } from 'react'
import { View } from 'react-native'
import { useNavigation } from 'expo-router'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated'
import { useColors } from '../hooks/useColors'

const EASE = Easing.out(Easing.cubic)

export default function AnimatedEntry({ children }: { children: ReactNode }) {
  const { COLORS } = useColors()
  const navigation = useNavigation()
  const translateY = useSharedValue(20)

  useEffect(() => {
    if (navigation.isFocused()) {
      translateY.value = withTiming(0, { duration: 250, easing: EASE })
    }

    const unsub = navigation.addListener('focus', () => {
      translateY.value = 8
      translateY.value = withTiming(0, { duration: 180, easing: EASE })
    })
    return unsub
  }, [navigation])

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.rosePale }}>
      <Animated.View style={[{ flex: 1 }, animStyle]}>
        {children}
      </Animated.View>
    </View>
  )
}
