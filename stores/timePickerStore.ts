import { create } from 'zustand'

type TimePickerStore = {
  visible: boolean
  value: string
  mode: 'hour' | 'min' | null
  onChange: ((v: string) => void) | null
  open: (val: string, onChange: (v: string) => void) => void
  setMode: (m: 'hour' | 'min' | null) => void
  setValue: (v: string) => void
  close: () => void
}

export const useTimePickerStore = create<TimePickerStore>((set) => ({
  visible: false,
  value: '12:00',
  mode: null,
  onChange: null,
  open: (val, onChange) => set({ visible: true, value: val, onChange, mode: null }),
  setMode: (mode) => set({ mode }),
  setValue: (value) => set({ value }),
  close: () => set({ visible: false, mode: null }),
}))