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
  setActiveBroker: (broker: 'local' | 'cloud' | 'none') => void
}

/**
 * 从 rooms Map 计算全屋统计数据
 *
 * @param rooms - 所有房间的传感器数据
 * @returns 包含平均温度、平均湿度、在线设备数
 */
function computeStats(rooms: Map<string, RoomSensorData>): Omit<GlobalStats, 'activeBroker'> {
  const values = Array.from(rooms.values())
  if (values.length === 0) {
    return { avgTemp: 0, avgHumi: 0, onlineCount: 0 }
  }
  const online = values.filter((r) => r.status === 'online')
  return {
    avgTemp: +(values.reduce((s, r) => s + r.temp, 0) / values.length).toFixed(1),
    avgHumi: +(values.reduce((s, r) => s + r.humi, 0) / values.length).toFixed(0),
    onlineCount: online.length,
  }
}

export const useSensorStore = create<SensorState>((set) => ({
  rooms: new Map(),
  brokerHealth: { local: true, cloud: true },
  globalStats: { avgTemp: 0, avgHumi: 0, onlineCount: 0, activeBroker: 'none' },

  updateRoom: (id, data) => {
    set((state) => {
      const rooms = new Map(state.rooms)
      rooms.set(id, { ...data, lastUpdate: Date.now() } as RoomSensorData)
      const stats = computeStats(rooms)
      return {
        rooms,
        globalStats: { ...state.globalStats, ...stats },
      }
    })
  },

  setBrokerHealth: (broker, online) => {
    set((state) => ({
      brokerHealth: { ...state.brokerHealth, [broker]: online },
    }))
  },

  setActiveBroker: (broker) => {
    set((state) => ({
      globalStats: { ...state.globalStats, activeBroker: broker },
    }))
  },
}))