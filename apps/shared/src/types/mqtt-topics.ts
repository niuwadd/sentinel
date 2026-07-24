/** MQTT 主题定义 — 用于发布/订阅时拼接完整 topic 路径 */
export const MQTT_TOPICS = {
  /** ESP32 上报传感器数据 → Broker */
  SENSOR_DATA: (roomId: string) => `house/room/${roomId}/data` as const,
  /** ESP32 上报在线/离线/故障状态 → Broker */
  DEVICE_STATUS: (roomId: string) => `house/room/${roomId}/status` as const,
  /** ESP32 上报空调电源启停状态 → Broker */
  AC_POWER: (roomId: string) => `house/room/${roomId}/ac/power` as const,
  /** 后端/AI 下发空调控制指令 → Broker → ESP32 */
  AC_CONTROL: (roomId: string) => `house/room/${roomId}/ac/ctrl` as const,
  /** 后端下发设备参数配置 → Broker → ESP32 */
  DEVICE_CONFIG: (roomId: string) => `house/room/${roomId}/config` as const,
  /** 离线恢复后云端同步缓存的离线数据 → 本地 Broker → 设备 */
  DEVICE_SYNC: (roomId: string) => `house/room/${roomId}/sync` as const,
  /** Agent 决策日志，推给前端展示 */
  AGENT_DECISION: 'house/agent/decision',
} as const

/** MQTT 通配订阅模式 — 一条订阅匹配所有房间的同类消息 */
export const MQTT_PATTERNS = {
  /** 订阅所有房间的传感器数据 */
  SENSOR_DATA: 'house/room/+/data',
  /** 订阅所有房间的设备状态 */
  DEVICE_STATUS: 'house/room/+/status',
} as const
