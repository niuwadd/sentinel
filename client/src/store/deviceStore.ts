import { create } from 'zustand'

interface DeviceState {
  selectedRoomId: string | null
  setSelectedRoom: (id: string | null) => void
}

export const useDeviceStore = create<DeviceState>((set) => ({
  selectedRoomId: null,
  setSelectedRoom: (id) => set({ selectedRoomId: id }),
}))
