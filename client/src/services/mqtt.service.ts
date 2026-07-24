import type { SensorDataPayload, AiDecisionPayload } from '@climelens/shared'

export type MqttMessageHandler = {
  onSensorData: (data: SensorDataPayload) => void
  onAiDecision: (data: AiDecisionPayload) => void
}

export class MqttService {
  private client: any | null = null

  connect(_target: 'local' | 'cloud') {
    // TODO: 实现 mqtt.js 连接
  }

  disconnect() {
    this.client?.end()
    this.client = null
  }

  subscribe(_handler: MqttMessageHandler) {
    // TODO: 订阅主题
  }

  publish(_topic: string, _payload: string) {
    // TODO: 发布消息
  }
}
