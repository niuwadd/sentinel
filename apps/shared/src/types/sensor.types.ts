/** ESP32 传感器通过 MQTT 上报的数据结构 */
export interface SensorDataPayload {
  /** 设备唯一标识，如 "room_living" */
  deviceId: string
  /** 消息类型 */
  type: 'sensor'
  /** 温度（℃） */
  temp: number
  /** 相对湿度（%） */
  humi: number
  /** 体感温度 / 热指数（℃） */
  heatIndex: number
  /** 电池电量（%） */
  battery: number
  /** WiFi 信号强度（dBm） */
  rssi: number
  /** 数据经由哪个 Broker */
  broker: 'local' | 'cloud'
  /** 设备在线状态 */
  status: 'online' | 'offline' | 'fault'
  /** 采集时间（ISO 8601） */
  timestamp: string
}

/** 前端 store 中缓存的房间传感器数据，比上报多一个接收时间戳 */
export interface RoomSensorData extends SensorDataPayload {
  /** 前端收到消息的本地时间戳（毫秒） */
  lastUpdate: number
}
