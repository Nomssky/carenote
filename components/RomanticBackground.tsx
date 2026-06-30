import { useEffect, useMemo, useState } from 'react'
import { View, Text } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withDelay, withSequence, Easing } from 'react-native-reanimated'
import { useColors } from '../hooks/useColors'

const POOL = [
  { emoji: '🌸' }, { emoji: '🌸' }, { emoji: '🌷' }, { emoji: '🌹' },
  { emoji: '🌺' }, { emoji: '🌻' }, { emoji: '🌼' }, { emoji: '🌸' },
  { emoji: '💕' }, { emoji: '💖' }, { emoji: '💗' }, { emoji: '💘' },
  { emoji: '💝' }, { emoji: '💞' }, { emoji: '❤️' }, { emoji: '🩷' },
  { emoji: '🌿' }, { emoji: '☘️' }, { emoji: '🍀' }, { emoji: '✨' },
  { emoji: '💫' }, { emoji: '🪷' }, { emoji: '🏵️' }, { emoji: '💐' },
  { emoji: '💌' }, { emoji: '🦋' }, { emoji: '🍃' }, { emoji: '🌱' },
  { emoji: '🩵' }, { emoji: '🩶' },
]

const FALLING_PETALS = ['🌸', '🌷', '🍃', '🌺', '🌼', '🌸', '🍃']

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function randomSize(min = 22, max = 40) {
  const sizes: number[] = []
  for (let s = min; s <= max; s += 2) sizes.push(s)
  return sizes[Math.floor(Math.random() * sizes.length)]
}

function randomRotate() {
  return `${Math.floor(Math.random() * 60 - 30)}deg`
}

function gridPosition(index: number, total: number, cols = 5) {
  const row = Math.floor(index / cols)
  const col = index % cols
  const cellW = 100 / cols
  const cellH = 100 / Math.ceil(total / cols)
  const pad = 3
  const top = `${row * cellH + Math.random() * (cellH - pad)}%`
  const left = `${col * cellW + Math.random() * (cellW - pad)}%`
  return { top, left }
}

function FloatingItem({ d, opacity, index }: { d: { emoji: string; top: string; left: string; size: number; rotate: string }; opacity: number; index: number }) {
  const floatY = useSharedValue(0)

  useEffect(() => {
    const duration = 2500 + Math.random() * 3000
    const distance = 6 + Math.random() * 10
    floatY.value = withDelay(
      index * 200,
      withRepeat(
        withSequence(
          withTiming(-distance, { duration, easing: Easing.inOut(Easing.sin) }),
          withTiming(distance, { duration, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true
      )
    )
  }, [])

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }))

  return (
    <View style={{ position: 'absolute', top: d.top as any, left: d.left as any }}>
      <Animated.View style={animStyle}>
        <Text style={{ fontSize: d.size, opacity, transform: [{ rotate: d.rotate }] }}>{d.emoji}</Text>
      </Animated.View>
    </View>
  )
}

function FallingPetal({ petal, index, opacity }: { petal: string; index: number; opacity: number }) {
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const rotate = useSharedValue('0deg')

  const [pos] = useState(() => ({
    left: Math.random() * 90 + 5,
    top: -(Math.random() * 30 + 20),
    size: 18 + Math.random() * 14,
    duration: 6000 + Math.random() * 8000,
    drift: 40 + Math.random() * 60,
    endRotate: 30 + Math.random() * 60,
  }))

  useEffect(() => {
    translateX.value = withRepeat(
      withSequence(
        withTiming(-pos.drift, { duration: pos.duration * 0.5 }),
        withTiming(pos.drift, { duration: pos.duration * 0.5 }),
      ),
      -1,
      true
    )
    translateY.value = withRepeat(
      withTiming(150, { duration: pos.duration, easing: Easing.linear }),
      -1,
      false
    )
    rotate.value = withRepeat(
      withTiming(`${pos.endRotate}deg`, { duration: pos.duration }),
      -1,
      false
    )
  }, [])

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: rotate.value },
    ],
  }))

  return (
    <View style={{ position: 'absolute', left: `${pos.left}%`, top: pos.top }}>
      <Animated.View style={animStyle}>
        <Text style={{ fontSize: pos.size, opacity: opacity * 0.7 }}>{petal}</Text>
      </Animated.View>
    </View>
  )
}

export default function RomanticBackground() {
  const { isDark } = useColors()
  const opacity = isDark ? 0.3 : 0.28
  const petalOpacity = isDark ? 0.25 : 0.2

  const { items, petals } = useMemo(() => {
    const itemCount = 25 + Math.floor(Math.random() * 6)
    const picked = shuffle(POOL).slice(0, itemCount)
    const items = picked.map((p, i) => ({
      emoji: p.emoji,
      size: randomSize(),
      rotate: randomRotate(),
      ...gridPosition(i, itemCount, 5),
    }))
    const petalCount = 5 + Math.floor(Math.random() * 4)
    const petalList = shuffle(FALLING_PETALS).slice(0, petalCount)
    return { items, petals: petalList }
  }, [])

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {items.map((d, i) => (
        <FloatingItem key={i} d={d} opacity={opacity} index={i} />
      ))}
      {petals.map((p, i) => (
        <FallingPetal key={`p${i}`} petal={p} index={i} opacity={petalOpacity} />
      ))}
    </View>
  )
}
