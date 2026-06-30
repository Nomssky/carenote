import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

export function formatTime(time: string): string {
  const [h, m] = time.split(':')
  return `${h}:${m}`
}

export function formatDate(date: string): string {
  return format(parseISO(date), 'EEEE, d MMMM', { locale: id })
}

export function todayDate(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function generatePairCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

export function getDayOfWeek(): number {
  const d = new Date().getDay()
  return d === 0 ? 7 : d
}
