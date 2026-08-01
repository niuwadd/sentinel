import { useEffect, useState } from 'react'
import { wsService } from '@/services/ws.service'
import { useAiStore } from '@/store/aiStore'
import { useSensorStore } from '@/store/sensorStore'

/**
 * WebSocket 网关连接 Hook — 将网关推送的传感器与 AI 决策同步到 store。
 *
 * 组件挂载时连接后端网关，收到 sensor:update / device:status 写入 sensorStore，
 * 收到 ai:decision 写入 aiStore，卸载时断开连接。
 *
 * @returns connected — 网关连接状态。
 */
export function useWebSocket() {
  const [connected, setConnected] = useState(false)
  const updateRoom = useSensorStore((s) => s.updateRoom)
  const updateRoomStatus = useSensorStore((s) => s.updateRoomStatus)
  const addDecision = useAiStore((s) => s.addDecision)

  useEffect(() => {
    wsService.subscribe({
      onSensorUpdate: (data) => updateRoom(data.deviceId, data),
      onDeviceStatus: (data) => updateRoomStatus(data.deviceId, data),
      onAiDecision: (decision) => addDecision(decision),
    })
    wsService.onStatusChange(setConnected)
    wsService.connect()

    return () => {
      wsService.disconnect()
    }
  }, [addDecision, updateRoom, updateRoomStatus])

  return { connected }
}
