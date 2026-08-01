import mqtt, { type MqttClient, type IClientOptions } from 'mqtt'
import { MQTT_PATTERNS, MQTT_TOPICS } from '@climelens/shared'
import type {
  AiDecisionPayload,
  DeviceStatusPayload,
  SensorDataPayload,
} from '@climelens/shared'

export type BrokerTarget = 'local' | 'cloud'
export type ConnStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected'

interface MqttBrokerConfig {
  url: string
  protocol: 'ws' | 'wss'
}

const BROKERS: Record<BrokerTarget, MqttBrokerConfig> = {
  local: {
    url: 'ws://localhost:8083/mqtt',
    protocol: 'ws',
  },
  cloud: {
    url: 'wss://cloud.emqx.io:8084/mqtt',
    protocol: 'wss',
  },
}

const LOCAL_FALLBACK_TIMEOUT = 5000
const CLOUD_RECONNECT_TIMEOUT = 3000

export type MqttMessageHandler = {
  onSensorData: (data: SensorDataPayload) => void
  onDeviceStatus: (data: DeviceStatusPayload) => void
  onAiDecision: (data: AiDecisionPayload) => void
}

export class MqttService {
  private client: MqttClient | null = null
  private handler: MqttMessageHandler | null = null
  private target: BrokerTarget | null = null
  private status: ConnStatus = 'idle'
  private statusChangeHandler:
    | ((status: ConnStatus, broker: BrokerTarget) => void)
    | undefined
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private shouldMaintainConnection = false

  /**
   * 连接到指定的 MQTT Broker（本地或云端），失败时回调 onStatusChange
   *
   * @param target - 连接目标：local 优先，cloud 兜底
   * @param onStatusChange - 连接状态变化回调，用于通知 UI
   */
  connect(
    target: BrokerTarget,
    onStatusChange?: (status: ConnStatus, broker: BrokerTarget) => void,
  ) {
    this.clearReconnectTimer()
    this.shouldMaintainConnection = true
    this.statusChangeHandler = onStatusChange

    if (this.client) {
      const currentClient = this.client
      this.client = null
      currentClient.end(true)
    }

    this.connectTarget(target)
  }

  /**
   * 建立与目标 Broker 的单次连接，并注册连接生命周期处理器。
   *
   * @param target - 本次连接的目标 Broker。
   * @returns 无返回值。
   */
  private connectTarget(target: BrokerTarget) {
    this.target = target
    this.status = 'connecting'
    this.statusChangeHandler?.('connecting', target)

    const config = BROKERS[target]
    const options: IClientOptions = {
      clientId: `web_${Math.random().toString(36).slice(2, 10)}`,
      keepalive: 60,
      connectTimeout: 5000,
      reconnectPeriod: 0,
    }

    const client = mqtt.connect(config.url, options)
    this.client = client

    if (target === 'local') {
      this.scheduleLocalFallback(client)
    }

    client.on('connect', () => {
      if (this.client !== client) return

      this.status = 'connected'
      this.clearReconnectTimer()
      this.statusChangeHandler?.('connected', target)

      client.subscribe(MQTT_PATTERNS.SENSOR_DATA, { qos: 1 }, (err) => {
        if (err) console.error('[MQTT] subscribe sensor data failed:', err)
      })
      client.subscribe(MQTT_PATTERNS.DEVICE_STATUS, { qos: 1 }, (err) => {
        if (err) console.error('[MQTT] subscribe device status failed:', err)
      })
      client.subscribe(MQTT_TOPICS.AGENT_DECISION, { qos: 1 }, (err) => {
        if (err) console.error('[MQTT] subscribe agent decision failed:', err)
      })
    })

    client.on('reconnect', () => {
      if (this.client !== client) return

      this.status = 'reconnecting'
      this.statusChangeHandler?.('reconnecting', target)
    })

    client.on('close', () => {
      if (this.client !== client || !this.shouldMaintainConnection) return

      this.client = null
      this.status = 'disconnected'
      this.statusChangeHandler?.('disconnected', target)

      if (target === 'local') {
        this.scheduleLocalFallback()
        return
      }

      this.scheduleCloudReconnect()
    })

    client.on('error', (err) => {
      console.error('[MQTT] connection error:', err)
    })

    client.on('message', (topic, payload) => {
      this.handleMessage(topic, payload)
    })
  }

  /**
   * 断开当前 MQTT 连接，释放资源
   */
  disconnect() {
    this.shouldMaintainConnection = false
    this.clearReconnectTimer()
    if (this.client) {
      const currentClient = this.client
      this.client = null
      currentClient.end(true)
    }
    this.status = 'disconnected'
    this.target = null
  }

  /**
   * 在本地 Broker 未能建立或维持连接时，延迟切换到云端 Broker。
   *
   * @param expectedClient - 首次连接时预期仍处于连接中的本地客户端。
   * @returns 无返回值。
   */
  private scheduleLocalFallback(expectedClient?: MqttClient) {
    this.clearReconnectTimer()
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null

      if (!this.shouldMaintainConnection || this.target !== 'local') return
      if (expectedClient && this.client !== expectedClient) return
      if (this.status === 'connected') return

      if (this.client) {
        const currentClient = this.client
        this.client = null
        currentClient.end(true)
      }

      this.connectTarget('cloud')
    }, LOCAL_FALLBACK_TIMEOUT)
  }

  /**
   * 云端 Broker 断开后，延迟重新建立云端连接。
   *
   * @returns 无返回值。
   */
  private scheduleCloudReconnect() {
    this.clearReconnectTimer()
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null

      if (!this.shouldMaintainConnection || this.target !== 'cloud') return
      this.connectTarget('cloud')
    }, CLOUD_RECONNECT_TIMEOUT)
  }

  /**
   * 清除尚未执行的切换或重连定时器。
   *
   * @returns 无返回值。
   */
  private clearReconnectTimer() {
    if (!this.reconnectTimer) return
    clearTimeout(this.reconnectTimer)
    this.reconnectTimer = null
  }

  /**
   * 注册消息处理器，传感器数据和 AI 决策消息到达时回调
   *
   * @param handler - 回调集合（onSensorData / onAiDecision）
   */
  subscribe(handler: MqttMessageHandler) {
    this.handler = handler
  }

  /**
   * 向指定主题发布消息
   *
   * @param topic - MQTT 主题，如 house/room/living/data
   * @param payload - 消息体（将被 JSON 序列化）
   * @param qos - 服务质量等级，默认 1
   */
  publish(topic: string, payload: unknown, qos: 0 | 1 | 2 = 1) {
    if (!this.client || !this.client.connected) {
      console.warn('[MQTT] client not connected, cannot publish')
      return
    }
    this.client.publish(topic, JSON.stringify(payload), { qos })
  }

  /**
   * 查询当前 Broker 连接状态
   *
   * @returns 包含 status 和 target 的信息对象
   */
  getStatus(): { status: ConnStatus; target: BrokerTarget | null } {
    return { status: this.status, target: this.target }
  }

  /**
   * 内部方法：根据主题分发消息到对应 handler
   *
   * @param topic - MQTT 主题
   * @param payload - 原始 Buffer，需 JSON.parse
   */
  private handleMessage(topic: string, payload: Buffer) {
    try {
      const data = JSON.parse(payload.toString())

      if (topic.endsWith('/data')) {
        this.handler?.onSensorData(data as SensorDataPayload)
        return
      }

      if (topic.endsWith('/status')) {
        this.handler?.onDeviceStatus(data as DeviceStatusPayload)
        return
      }

      if (topic === MQTT_TOPICS.AGENT_DECISION) {
        this.handler?.onAiDecision(data as AiDecisionPayload)
        return
      }
    } catch (err) {
      console.error('[MQTT] failed to parse message on topic', topic, err)
    }
  }
}

export const mqttService = new MqttService()
