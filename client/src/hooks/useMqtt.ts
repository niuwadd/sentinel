import { useCallback, useEffect, useState } from 'react'
import { mqttService, type ConnStatus } from '@/services/mqtt.service'
import { useSensorStore } from '@/store/sensorStore'
import { useAiStore } from '@/store/aiStore'

type BrokerTarget = 'local' | 'cloud'

/**
 * MQTT 连接管理 Hook — 同步 MQTT 服务的连接状态和业务消息
 *
 * 组件挂载时自动连接本地 Broker。MqttService 负责本地断线后的云端降级与云端重连，
 * Hook 仅负责将状态和业务消息同步到 Zustand Store。
 * 收到传感器数据时写入 sensorStore，收到 AI 决策时写入 aiStore。
 * 连接状态变化后更新 sensorStore 的 brokerHealth 和 activeBroker。
 *
 * @returns connectedBroker — 当前连接的 Broker 标识，未连接时为 null
 * @returns status — 连接状态（connecting / connected / reconnecting / disconnected）
 * @returns connect — 手动切换 Broker 的方法
 */
export function useMqtt() {
  const [connectedBroker, setConnectedBroker] = useState<BrokerTarget | null>(null)
  const [status, setStatus] = useState<ConnStatus>('disconnected')

  const updateRoom = useSensorStore((s) => s.updateRoom)
  const updateRoomStatus = useSensorStore((s) => s.updateRoomStatus)
  const setBrokerHealth = useSensorStore((s) => s.setBrokerHealth)
  const setActiveBroker = useSensorStore((s) => s.setActiveBroker)
  const addDecision = useAiStore((s) => s.addDecision)

  /**
   * 连接指定 Broker 并记录状态
   *
   * @param target - 目标 Broker
   */
  const connect = useCallback((target: BrokerTarget) => {
    mqttService.connect(target, (newStatus, broker) => {
      setStatus(newStatus)

      if (newStatus === 'connected') {
        setConnectedBroker(broker)
        setBrokerHealth(broker, true)
        setActiveBroker(broker)
        return
      }

      if (newStatus === 'disconnected') {
        setBrokerHealth(broker, false)
        setConnectedBroker((currentBroker) =>
          currentBroker === broker ? null : currentBroker,
        )
        setActiveBroker('none')
      }
    })
  }, [setActiveBroker, setBrokerHealth])

  useEffect(() => {
    mqttService.subscribe({
      onSensorData: (data) => updateRoom(data.deviceId, data),
      onDeviceStatus: (data) => updateRoomStatus(data.deviceId, data),
      onAiDecision: (decision) => addDecision(decision),
    })

    connect('local')

    return () => {
      mqttService.disconnect()
    }
  }, [addDecision, connect, updateRoom, updateRoomStatus])

  return { connectedBroker, status, connect }
}
