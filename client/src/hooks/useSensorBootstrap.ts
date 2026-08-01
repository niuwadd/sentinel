import { useEffect } from 'react'
import { apiService, type RoomResponse } from '@/services/api.service'
import { useSensorStore, type RoomSnapshot } from '@/store/sensorStore'

/**
 * 应用挂载时从后端拉取房间传感器快照并写入 sensorStore。
 *
 * 后端不可达或房间尚无数据时静默跳过，3D 场景回退到静态默认值。
 *
 * @returns 无返回值。
 */
export function useSensorBootstrap() {
  const hydrateRooms = useSensorStore((s) => s.hydrateRooms)

  useEffect(() => {
    let active = true

    apiService
      .getRooms()
      .then((rooms) => {
        if (!active) return

        const snapshots: RoomSnapshot[] = rooms
          .filter(
            (room): room is RoomResponse & { currentTemp: number; currentHumi: number } =>
              room.currentTemp != null && room.currentHumi != null,
          )
          .map((room) => ({
            deviceId: room.id,
            temp: room.currentTemp,
            humi: room.currentHumi,
            status: room.status,
            timestamp: room.lastUpdate ?? undefined,
          }))

        if (snapshots.length > 0) hydrateRooms(snapshots)
      })
      .catch(() => undefined)

    return () => {
      active = false
    }
  }, [hydrateRooms])
}
