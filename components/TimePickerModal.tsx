import {
  View, Text, TouchableOpacity,
  ScrollView, StyleSheet, Platform,
} from 'react-native'
import { useTimePickerStore } from '../stores/timePickerStore'
import { useColors } from '../hooks/useColors'

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINS = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'))

export default function TimePickerModal() {
  const { COLORS } = useColors()
  const { visible, value, mode, onChange, setMode, setValue, close } = useTimePickerStore()

  const [h, m] = value.split(':').map(Number)
  const hour = isNaN(h) ? 12 : h
  const min = isNaN(m) ? 0 : m

  const items = mode === 'hour' ? HOURS : MINS
  const current = mode === 'hour' ? String(hour).padStart(2, '0') : String(min).padStart(2, '0')

  function select(val: string) {
    const next = mode === 'hour'
      ? `${val}:${String(min).padStart(2, '0')}`
      : `${String(hour).padStart(2, '0')}:${val}`
    setValue(next)
    onChange?.(next)
    close()
  }

  if (!visible) return null

  return (
    <View style={s.overlay}>
      <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={close} />
      <View style={[s.sheet, { backgroundColor: COLORS.white }]}>
        <View style={[s.display, { borderBottomColor: COLORS.line }]}>
          <TouchableOpacity onPress={() => setMode(mode === 'hour' ? null : 'hour')} activeOpacity={0.5}>
            <Text style={[s.digit, { color: COLORS.ink }, mode === 'hour' && { backgroundColor: COLORS.blush }]}>
              {String(hour).padStart(2, '0')}
            </Text>
          </TouchableOpacity>
          <Text style={[s.colon, { color: COLORS.ink }]}>:</Text>
          <TouchableOpacity onPress={() => setMode(mode === 'min' ? null : 'min')} activeOpacity={0.5}>
            <Text style={[s.digit, { color: COLORS.ink }, mode === 'min' && { backgroundColor: COLORS.blush }]}>
              {String(min).padStart(2, '0')}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
          {items.map((val) => (
            <TouchableOpacity
              key={val}
              style={[s.item, val === current && { backgroundColor: COLORS.blush }]}
              onPress={() => select(val)}
            >
              <Text style={[s.itemText, { color: COLORS.ink }, val === current && { color: COLORS.roseDark }]}>
                {val}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  overlay: {
    ...Platform.select({
      web: { position: 'fixed' as any, top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 },
      default: { ...StyleSheet.absoluteFillObject, elevation: 9999, zIndex: 9999 },
    }),
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: 420,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  display: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingBottom: 16,
    borderBottomWidth: 1,
    marginHorizontal: 24,
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
  scroll: {
    maxHeight: 280,
    paddingVertical: 8,
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  itemText: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 24,
  },
})
