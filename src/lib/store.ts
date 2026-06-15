import { create } from 'zustand'

interface AppStore {
  sidebarOpen: boolean
  activeDate: Date
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setActiveDate: (date: Date) => void
}

export const useAppStore = create<AppStore>((set) => ({
  sidebarOpen: true,
  activeDate: new Date(),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveDate: (date) => set({ activeDate: date }),
}))
