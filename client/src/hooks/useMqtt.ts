import { useEffect, useRef, useState } from 'react'
import { mqttService, type ConnStatus } from '@/services/mqtt.service'
import { useSensorStore } from '@/store/sensorStore'
import { useAiStore } from '@/store/aiStore'

type BrokerTarget = 'local' | 'cloud'

const FALLBACK_TIMEOUT = 5000

/**
 * MQTT 连接管理 Hook — 本地 Broker 优先，连不上自动切到云端
 *
 * 组件挂载时自动连本地 Broker；5 秒连不上自动改连云端。
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

  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateRoom = useSensorStore((s) => s.updateRoom)
  const setBrokerHealth = useSensorStore((s) => s.setBrokerHealth)
  const setActiveBroker = useSensorStore((s) => s.setActiveBroker)
  const addDecision = useAiStore((s) => s.addDecision)

  /**
   * 连接指定 Broker 并记录状态
   *
   * @param target - 目标 Broker
   */
  const connect = (target: BrokerTarget) => {
    if (fallbackTimer.current) {
      clearTimeout(fallbackTimer.current)
      fallbackTimer.current = null
    }

    mqttService.connect(target, (newStatus, broker) => {
      setStatus(newStatus)

      if (newStatus === 'connected') {
        setConnectedBroker(broker)
        setBrokerHealth(broker, true)
        setActiveBroker(broker)
        if (fallbackTimer.current) {
          clearTimeout(fallbackTimer.current)
          fallbackTimer.current = null
        }
        return
      }

      if (newStatus === 'disconnected') {
        setBrokerHealth(broker, false)
      }
    })

    if (target === 'local') {
      fallbackTimer.current = setTimeout(() => {
        if (!connectedBroker) {
          console.warn('[useMqtt] local broker unreachable, falling back to cloud')
          connect('cloud')
        }
      }, FALLBACK_TIMEOUT)
    }
  }

  useEffect(() => {
    mqttService.subscribe({
      onSensorData: (data) => updateRoom(data.deviceId, data),
      onAiDecision: (decision) => addDecision(decision),
    })

    connect('local')

    return () => {
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current)
      mqttService.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { connectedBroker, status, connect }
}