import { create } from 'zustand'
import type { RoomSensorData, SensorDataPayload } from '@climelens/shared'

interface GlobalStats {
  avgTemp: number
  avgHumi: number
  onlineCount: number
  activeBroker: 'local' | 'cloud' | 'none'
}

interface SensorState {
  rooms: Map<string, RoomSensorData>
  brokerHealth: { local: boolean; cloud: boolean }
  globalStats: GlobalStats
  updateRoom: (id: string, data: SensorDataPayload) => void
  setBrokerHealth: (broker: 'local' | 'cloud', online: boolean) => void
}

export const useSensorStore = create<SensorState>((set) => ({
  rooms: new Map(),
  brokerHealth: { local: true, cloud: true },
  globalStats: { avgTemp: 0, avgHumi: 0, onlineCount: 0, activeBroker: 'local' },

  updateRoom: (id, data) => {
    set((state) => {
      const rooms = new Map(state.rooms)
      rooms.set(id, { ...data, lastUpdate: Date.now() } as RoomSensorData)
      return { rooms }
    })
  },

  setBrokerHealth: (broker, online) => {
    set((state) => ({
      brokerHealth: { ...state.brokerHealth, [broker]: online },
    }))
  },
}))
