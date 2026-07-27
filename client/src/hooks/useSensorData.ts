import { useSensorStore } from '@/store/sensorStore'
import type { RoomSensorData } from '@climelens/shared'

/**
 * 从 sensorStore 读取指定房间的实时传感器数据
 *
 * 数据来源是 MQTT 消息经 useMqtt → sensorStore.updateRoom() 写入，
 * 组件调用此 hook 即可订阅房间温湿度变化，store 更新后自动 re-render。
 *
 * @param roomId - 房间标识，如 "living"、"bedroom"
 * @returns 房间传感器数据，若该房间暂无数据则返回 undefined
 */
export function useSensorData(roomId: string): RoomSensorData | undefined {
  return useSensorStore((state) => state.rooms.get(roomId))
}