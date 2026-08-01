import { io, type Socket } from 'socket.io-client'
import type {
  AiDecisionPayload,
  DeviceStatusPayload,
  SensorDataPayload,
} from '@climelens/shared'

export type WsMessageHandler = {
  onSensorUpdate: (data: SensorDataPayload) => void
  onDeviceStatus: (data: DeviceStatusPayload) => void
  onAiDecision: (data: AiDecisionPayload) => void
}

export class WsService {
  private socket: Socket | null = null
  private handler: WsMessageHandler | null = null
  private statusChangeHandler: ((connected: boolean) => void) | undefined

  /**
   * 建立与后端 WebSocket 网关的连接并注册事件监听。
   *
   * @param url - 网关地址，缺省时连接当前站点同源（开发环境经 Vite 代理转发）。
   * @returns 无返回值。
   */
  connect(url = '') {
    if (this.socket) return
    this.socket = io(url || undefined, { path: '/socket.io', transports: ['websocket'] })

    this.socket.on('sensor:update', (data: SensorDataPayload) => {
      this.handler?.onSensorUpdate(data)
    })
    this.socket.on('device:status', (data: DeviceStatusPayload) => {
      this.handler?.onDeviceStatus(data)
    })
    this.socket.on('ai:decision', (data: AiDecisionPayload) => {
      this.handler?.onAiDecision(data)
    })
    this.socket.on('connect', () => {
      this.statusChangeHandler?.(true)
    })
    this.socket.on('disconnect', () => {
      this.statusChangeHandler?.(false)
    })
  }

  /**
   * 注册网关事件的业务消息处理器。
   *
   * @param handler - 传感器更新、设备状态、AI 决策三类消息的回调集合。
   * @returns 无返回值。
   */
  subscribe(handler: WsMessageHandler) {
    this.handler = handler
  }

  /**
   * 注册连接状态变化回调。
   *
   * @param callback - 连接建立或断开时接收 boolean 的回调。
   * @returns 无返回值。
   */
  onStatusChange(callback: (connected: boolean) => void) {
    this.statusChangeHandler = callback
  }

  /**
   * 断开与网关的连接并清理处理器。
   *
   * @returns 无返回值。
   */
  disconnect() {
    this.socket?.disconnect()
    this.socket = null
    this.handler = null
    this.statusChangeHandler = undefined
  }
}

export const wsService = new WsService()
