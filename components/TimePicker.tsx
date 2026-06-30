import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useTimePickerStore } from '../stores/timePickerStore'
import { useColors } from '../hooks/useColors'

type Props = {
  value: string
  onChange: (v: string) => void
}

export default function TimePicker({ value, onChange }: Props) {
  const { COLORS } = useColors()
  const open = useTimePickerStore((s) => s.open)
  const setMode = useTimePickerStore((s) => s.setMode)

  const [h, m] = value.split(':').map(Number)
  const hour = isNaN(h) ? 12 : h
  const min = isNaN(m) ? 0 : m

  function openPicker(initialMode: 'hour' | 'min') {
    open(value, onChange)
    setMode(initialMode)
  }

  return (
    <View style={[s.display, { backgroundColor: COLORS.white, borderColor: COLORS.line }]}>
      <TouchableOpacity onPress={() => openPicker('hour')} activeOpacity={0.5}>
        <Text style={[s.digit, { color: COLORS.ink }]}>
          {String(hour).padStart(2, '0')}
        </Text>
      </TouchableOpacity>
      <Text style={[s.colon, { color: COLORS.ink }]}>:</Text>
      <TouchableOpacity onPress={() => openPicker('min')} activeOpacity={0.5}>
        <Text style={[s.digit, { color: COLORS.ink }]}>
          {String(min).padStart(2, '0')}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  display: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  digit: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 40,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
  },
  colon: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 40,
  },
})
