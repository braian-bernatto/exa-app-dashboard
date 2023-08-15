import { create } from 'zustand'

interface useExaModalStore {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export const useExaModal = create<useExaModalStore>(set => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false })
}))
