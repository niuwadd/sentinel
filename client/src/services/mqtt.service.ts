import mqtt, { type MqttClient, type IClientOptions } from 'mqtt'
import { MQTT_PATTERNS, MQTT_TOPICS } from '@climelens/shared'
import type { SensorDataPayload, AiDecisionPayload } from '@climelens/shared'

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

export type MqttMessageHandler = {
  onSensorData: (data: SensorDataPayload) => void
  onAiDecision: (data: AiDecisionPayload) => void
}

export class MqttService {
  private client: MqttClient | null = null
  private handler: MqttMessageHandler | null = null
  private target: BrokerTarget | null = null
  private status: ConnStatus = 'idle'

  /**
   * 连接到指定的 MQTT Broker（本地或云端），失败时回调 onStatusChange
   *
   * @param target - 连接目标：local 优先，cloud 兜底
   * @param onStatusChange - 连接状态变化回调，用于通知 UI
   */
  connect(target: BrokerTarget, onStatusChange?: (status: ConnStatus, broker: BrokerTarget) => void) {
    if (this.client) this.disconnect()

    this.target = target
    this.status = 'connecting'
    onStatusChange?.('connecting', target)

    const config = BROKERS[target]
    const options: IClientOptions = {
      clientId: `web_${Math.random().toString(36).slice(2, 10)}`,
      keepalive: 60,
      connectTimeout: 5000,
      reconnectPeriod: 3000,
    }

    const client = mqtt.connect(config.url, options)

    client.on('connect', () => {
      this.status = 'connected'
      onStatusChange?.('connected', target)

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
      this.status = 'reconnecting'
      onStatusChange?.('reconnecting', target)
    })

    client.on('close', () => {
      this.status = 'disconnected'
      onStatusChange?.('disconnected', target)
    })

    client.on('error', (err) => {
      console.error('[MQTT] connection error:', err)
    })

    client.on('message', (topic, payload) => {
      this.handleMessage(topic, payload)
    })

    this.client = client
  }

  /**
   * 断开当前 MQTT 连接，释放资源
   */
  disconnect() {
    if (!this.client) return
    this.client.end(true)
    this.client = null
    this.status = 'disconnected'
    this.target = null
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