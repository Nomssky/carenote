import { View, Text } from 'react-native'
import { useColors } from '../hooks/useColors'

const DECORATIONS = [
  { emoji: '🌸', top: '5%', left: '8%', size: 32, rotate: '-15deg' },
  { emoji: '💕', top: '10%', right: '12%', size: 26, rotate: '10deg' },
  { emoji: '🌷', top: '22%', left: '55%', size: 34, rotate: '5deg' },
  { emoji: '💖', top: '35%', right: '5%', size: 30, rotate: '-8deg' },
  { emoji: '🌹', top: '48%', left: '6%', size: 36, rotate: '20deg' },
  { emoji: '💗', top: '55%', right: '10%', size: 24, rotate: '-5deg' },
  { emoji: '🌺', top: '70%', left: '4%', size: 32, rotate: '12deg' },
  { emoji: '💝', top: '82%', right: '6%', size: 28, rotate: '-12deg' },
  { emoji: '🌼', top: '18%', left: '30%', size: 28, rotate: '8deg' },
  { emoji: '💘', top: '65%', left: '55%', size: 30, rotate: '-3deg' },
  { emoji: '🌻', top: '40%', left: '40%', size: 26, rotate: '15deg' },
  { emoji: '💞', top: '78%', left: '50%', size: 22, rotate: '-10deg' },
  { emoji: '🌹', top: '90%', left: '20%', size: 28, rotate: '0deg' },
  { emoji: '❤️', top: '3%', left: '70%', size: 20, rotate: '5deg' },
  { emoji: '🌸', top: '50%', left: '75%', size: 24, rotate: '-20deg' },
]

export default function RomanticBackground() {
  const { isDark } = useColors()
  const opacity = isDark ? 0.22 : 0.2

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
      }}
    >
      {DECORATIONS.map((d, i) => (
        <Text
          key={i}
          style={{
            position: 'absolute',
            top: d.top as any,
            left: (d as any).left,
            right: (d as any).right,
            fontSize: d.size,
            opacity,
            transform: [{ rotate: d.rotate }],
          }}
        >
          {d.emoji}
        </Text>
      ))}
    </View>
  )
}
