import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { FONTS } from '../constants/theme'
import { useColors } from '../hooks/useColors'

const DAYS = [
  { label: 'Sen', value: 1 },
  { label: 'Sel', value: 2 },
  { label: 'Rab', value: 3 },
  { label: 'Kam', value: 4 },
  { label: 'Jum', value: 5 },
  { label: 'Sab', value: 6 },
  { label: 'Min', value: 7 },
]

type Props = {
  selected: number[]
  onChange: (days: number[]) => void
}

export default function DayPicker({ selected, onChange }: Props) {
  const { COLORS } = useColors()
  function toggle(val: number) {
    if (selected.includes(val)) {
      onChange(selected.filter(d => d !== val))
    } else {
      onChange([...selected, val].sort())
    }
  }

  return (
    <View style={s.row}>
      {DAYS.map(d => (
        <TouchableOpacity
          key={d.value}
          onPress={() => toggle(d.value)}
          style={[
            s.chip,
            selected.includes(d.value)
              ? { backgroundColor: COLORS.roseDark, borderColor: COLORS.roseDark }
              : { backgroundColor: COLORS.white, borderColor: COLORS.line },
          ]}
        >
          <Text style={[
            s.label,
            selected.includes(d.value) ? s.labelActive : { color: COLORS.muted },
          ]}>
            {d.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const s = StyleSheet.create({
  row:   { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip:  { width: 40, height: 40, borderRadius: 20,
           alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  label:        { fontFamily: FONTS.sansBold, fontSize: 12 },
  labelActive:  { color: '#fff' },
})
