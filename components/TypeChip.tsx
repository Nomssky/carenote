import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { FONTS, RADIUS } from '../constants/theme'
import { useColors } from '../hooks/useColors'

type Props = {
  label: string
  emoji: string
  color: string
  selected: boolean
  onPress: () => void
}

export default function TypeChip({ label, emoji, color, selected, onPress }: Props) {
  const { COLORS } = useColors()
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        s.chip,
        selected
          ? { backgroundColor: COLORS.rosePale, borderColor: COLORS.roseDark }
          : { backgroundColor: COLORS.white, borderColor: COLORS.line },
      ]}
    >
      <Text style={{ fontSize: 24 }}>{emoji}</Text>
      <Text style={[s.label, { color: COLORS.ink }, selected && { color: COLORS.roseDark }]}>{label}</Text>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  chip:         { borderRadius: RADIUS.sm, paddingVertical: 14, paddingHorizontal: 8,
                  alignItems: 'center', width: '30%', borderWidth: 1.5 },
  label:        { fontFamily: FONTS.sansBold, fontSize: 11, marginTop: 4 },
})
