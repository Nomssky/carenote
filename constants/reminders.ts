import { ReminderType } from '../types'

export const REMINDER_PRESETS: {
  type: ReminderType
  label: string
  emoji: string
  defaultMessage: string
  color: string
}[] = [
  {
    type: 'makan',
    label: 'Makan',
    emoji: '🍱',
    defaultMessage: 'Udah makan belum sayang?',
    color: '#E3F5EC',
  },
  {
    type: 'mandi',
    label: 'Mandi',
    emoji: '🚿',
    defaultMessage: 'Udah mandi belum? 🐧',
    color: '#FAE3E7',
  },
  {
    type: 'minum_air',
    label: 'Minum Air',
    emoji: '💧',
    defaultMessage: 'Jangan lupa minum air ya!',
    color: '#E8F4FD',
  },
  {
    type: 'obat',
    label: 'Obat',
    emoji: '💊',
    defaultMessage: 'Jangan lupa minum obatnya sayang',
    color: '#FDF3E0',
  },
  {
    type: 'tidur',
    label: 'Tidur',
    emoji: '🌙',
    defaultMessage: 'Udah malem, bobo ya 🥱',
    color: '#EEE8F8',
  },
  {
    type: 'olahraga',
    label: 'Olahraga',
    emoji: '🏃',
    defaultMessage: 'Jangan skip olahraga hari ini!',
    color: '#FFF0E0',
  },
  {
    type: 'sholat',
    label: 'Sholat',
    emoji: '🕌',
    defaultMessage: 'Udah sholat belum sayang?',
    color: '#C9E8D2',
  },
  {
    type: 'gereja',
    label: 'Gereja',
    emoji: '⛪',
    defaultMessage: 'Jangan lupa ke gereja ya!',
    color: '#E8D5F5',
  },
  {
    type: 'kerja',
    label: 'Kerja',
    emoji: '💼',
    defaultMessage: 'Semangat kerja hari ini!',
    color: '#E0D5F8',
  },
  {
    type: 'kucing',
    label: 'Kucing',
    emoji: '🐱',
    defaultMessage: 'Kasi makan kucingnya ya!',
    color: '#FDE8D0',
  },
  {
    type: 'cemilan',
    label: 'Ngemil',
    emoji: '🍪',
    defaultMessage: 'Jangan lupa ngemil biar ga lemes 🍪',
    color: '#FFF5D6',
  },
  {
    type: 'rehat',
    label: 'Istirahat',
    emoji: '☕',
    defaultMessage: 'Istirahat dulu, jangan terlalu capek!',
    color: '#D6EAF8',
  },
  {
    type: 'custom',
    label: 'Custom',
    emoji: '✏️',
    defaultMessage: '',
    color: '#F5F5F5',
  },
]

export const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
export const DAY_MAP = [7, 1, 2, 3, 4, 5, 6]
