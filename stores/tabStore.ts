import { create } from 'zustand'

type Dir = 'left' | 'right'

export const useTabStore = create<{
  dir: Dir
  setDir: (d: Dir) => void
}>((set) => ({
  dir: 'right',
  setDir: (dir) => set({ dir }),
}))
