/** 空调控制指令 */
export interface AcCommand {
  /** 电源开关 */
  power: 'on' | 'off'
  /** 工作模式：制冷 / 制热 / 送风 / 自动 */
  mode?: 'cool' | 'heat' | 'fan' | 'auto'
  /** 目标温度（℃） */
  targetTemp?: number
  /** 风速：低 / 中 / 高 / 自动 */
  fanSpeed?: 'low' | 'mid' | 'high' | 'auto'
  /** 是否开启摆风 */
  swing?: boolean
}

/** AI Agent 或用户手动下发的控制决策，通过 MQTT 推送给 ESP32 */
export interface AiDecisionPayload {
  /** 目标房间设备 ID */
  deviceId: string
  /** 消息类型 */
  type: 'command'
  /** 控制动作 */
  action: 'ac_control'
  /** 具体指令内容 */
  payload: AcCommand
  /** 决策来源 */
  source: 'ai_agent' | 'manual'
  /** 指令经由哪个 Broker 下发 */
  viaBroker: 'cloud' | 'local'
  /** AI 决策理由或用户备注 */
  reason: string
  /** 决策时间（ISO 8601） */
  timestamp: string
}
