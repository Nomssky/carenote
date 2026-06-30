export type Profile = {
  id: string
  name: string
  push_token: string | null
  last_seen: string | null
  created_at: string
}

export type Pair = {
  id: string
  user_a: string
  user_b: string | null
  pair_code: string
  status: 'pending' | 'active'
  created_at: string
}

export type ReminderType =
  | 'makan'
  | 'mandi'
  | 'minum_air'
  | 'obat'
  | 'tidur'
  | 'olahraga'
  | 'sholat'
  | 'gereja'
  | 'kerja'
  | 'kucing'
  | 'cemilan'
  | 'rehat'
  | 'custom'

export type Reminder = {
  id: string
  pair_id: string
  created_by: string
  target_user: string
  type: ReminderType
  message: string
  emoji: string
  remind_time: string
  repeat_days: number[]
  is_active: boolean
  created_at: string
}

export type Confirmation = {
  id: string
  reminder_id: string
  user_id: string
  status: 'done' | 'skip'
  note: string | null
  photo_url: string | null
  date: string
  responded_at: string
}

export type ReminderWithConfirmation = Reminder & {
  confirmation?: Confirmation
  creator_name?: string
}
