import { create } from 'zustand'
import type {
  DeviceStatusPayload,
  RoomSensorData,
  SensorDataPayload,
} from '@climelens/shared'

interface GlobalStats {
  avgTemp: number
  avgHumi: number
  onlineCount: number
  activeBroker: 'local' | 'cloud' | 'none'
}

export interface RoomSnapshot {
  deviceId: string
  temp: number
  humi: number
  status: 'online' | 'offline' | 'fault'
  timestamp?: string
}

interface SensorState {
  rooms: Map<string, RoomSensorData>
  brokerHealth: { local: boolean; cloud: boolean }
  globalStats: GlobalStats
  updateRoom: (id: string, data: SensorDataPayload) => void
  updateRoomStatus: (id: string, data: DeviceStatusPayload) => void
  hydrateRooms: (snapshots: RoomSnapshot[]) => void
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
  brokerHealth: { local: false, cloud: false },
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

  /**
   * 更新已有房间的设备在线状态，并保留最近一次传感器读数。
   *
   * @param id - 房间或设备标识。
   * @param data - MQTT 设备状态载荷。
   * @returns 无返回值。
   */
  updateRoomStatus: (id, data) => {
    set((state) => {
      const current = state.rooms.get(id)
      if (!current) return state

      const rooms = new Map(state.rooms)
      rooms.set(id, {
        ...current,
        status: data.status,
        timestamp: data.timestamp ?? current.timestamp,
        lastUpdate: Date.now(),
      })
      const stats = computeStats(rooms)
      return {
        rooms,
        globalStats: { ...state.globalStats, ...stats },
      }
    })
  },

  /**
   * 用后端返回的房间快照批量写入传感器缓存。
   *
   * 已有 MQTT 实时数据的房间不会被快照覆盖，仅补充缺失房间。
   *
   * @param snapshots - 后端房间快照列表（deviceId、温湿度、状态）。
   * @returns 无返回值。
   */
  hydrateRooms: (snapshots) => {
    set((state) => {
      const rooms = new Map(state.rooms)
      const receivedAt = Date.now()

      for (const snapshot of snapshots) {
        if (rooms.has(snapshot.deviceId)) continue
        rooms.set(snapshot.deviceId, {
          deviceId: snapshot.deviceId,
          type: 'sensor',
          temp: snapshot.temp,
          humi: snapshot.humi,
          heatIndex: snapshot.temp,
          battery: 0,
          rssi: 0,
          broker: 'local',
          status: snapshot.status,
          timestamp: snapshot.timestamp ?? new Date().toISOString(),
          lastUpdate: receivedAt,
        })
      }

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
