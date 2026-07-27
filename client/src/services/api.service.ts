import type { AcCommand } from '@climelens/shared'

interface RoomResponse {
  id: string
  name: string
  icon: string
  currentTemp: number | null
  currentHumi: number | null
  status: 'online' | 'offline' | 'fault'
  lastUpdate: string | null
}

interface RoomDetailResponse extends RoomResponse {
  devices: number
  airQuality: number | null
  outdoorTemp: number | null
}

interface RoomHistoryPoint {
  timestamp: string
  temp: number
  humi: number
}

interface AiDecisionLogItem {
  deviceId: string
  reason: string
  timestamp: string
  payload: AcCommand
}

class ApiError extends Error {
  /**
   * @param status - HTTP 状态码
   * @param message - 错误消息
   */
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ApiService {
  private baseUrl: string

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl
  }

  /**
   * 获取全屋房间列表
   *
   * @returns 每个房间的 id、名称、图标、当前温湿度、在线状态
   * @throws 请求失败或后端返回非 2xx 时抛出 ApiError
   */
  async getRooms(): Promise<RoomResponse[]> {
    return this.request<RoomResponse[]>('/rooms')
  }

  /**
   * 获取单个房间详情
   *
   * @param roomId - 房间标识，如 "living"、"bedroom"
   * @returns 房间详情（含设备数、空气质量、室外温度等扩展字段）
   * @throws 房间不存在时抛出 404 ApiError
   */
  async getRoom(roomId: string): Promise<RoomDetailResponse> {
    return this.request<RoomDetailResponse>(`/rooms/${roomId}`)
  }

  /**
   * 获取房间历史传感器数据
   *
   * @param roomId - 目标房间标识
   * @param range - 时间范围：1h / 6h / 24h / 7d / 30d，默认 24h
   * @returns 温湿度时序数据点数组
   * @throws 请求失败时抛出 ApiError
   */
  async getRoomHistory(roomId: string, range = '24h'): Promise<RoomHistoryPoint[]> {
    return this.request<RoomHistoryPoint[]>(`/rooms/${roomId}/data?range=${range}`)
  }

  /**
   * 向指定房间下发空调控制指令
   *
   * @param roomId - 目标房间标识
   * @param command - 空调控制指令（power 必填，其余可空）
   * @returns 后端确认消息
   * @throws 请求失败或指令非法时抛出 ApiError
   */
  async controlAc(roomId: string, command: AcCommand): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/rooms/${roomId}/ac/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(command),
    })
  }

  /**
   * 获取 AI 决策历史日志
   *
   * @returns 决策记录数组（按时间倒序）
   * @throws 请求失败时抛出 ApiError
   */
  async getAiDecisions(): Promise<AiDecisionLogItem[]> {
    return this.request<AiDecisionLogItem[]>('/agent/decisions')
  }

  /**
   * 统一 fetch 封装，自动添加 baseUrl、处理 JSON、非 2xx 抛异常
   *
   * @param path - 请求路径（不含 baseUrl 前缀），如 "/rooms/living"
   * @param init - fetch 配置项
   * @returns 解析后的 JSON 响应体
   * @throws 网络错误或 HTTP 非 2xx 时抛出 ApiError
   */
  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    let res: Response
    try {
      res = await fetch(`${this.baseUrl}${path}`, init)
    } catch (err) {
      throw new ApiError(0, `Network error: ${(err as Error).message}`)
    }

    const data = await this.parseBody(res)

    if (!res.ok) {
      throw new ApiError(res.status, (data as { message?: string })?.message ?? res.statusText)
    }

    return data as T
  }

  /**
   * 解析响应体为 JSON，空响应返回空对象
   *
   * @param res - fetch Response 对象
   * @returns 解析后的对象
   */
  private async parseBody(res: Response): Promise<unknown> {
    const text = await res.text()
    if (!text) return {}
    try {
      return JSON.parse(text)
    } catch {
      return { message: text }
    }
  }
}

export const apiService = new ApiService()