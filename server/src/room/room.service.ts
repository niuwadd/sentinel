import { Injectable, Logger } from '@nestjs/common';
import { MqttService } from '../mqtt/mqtt.service';
import type { RoomResponse, RoomDetailResponse, RoomHistoryPoint } from './dto/room-response.dto';

interface RoomRecord {
  id: string;
  name: string;
  icon: string;
  devices: number;
  airQuality: number | null;
  outdoorTemp: number | null;
}

interface SensorCacheEntry {
  temp: number;
  humi: number;
  status: 'online' | 'offline' | 'fault';
  timestamp: string;
}

@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name);

  private readonly rooms: RoomRecord[] = [
    { id: 'bedroom', name: '主卧', icon: 'bedroom_parent', devices: 3, airQuality: 8, outdoorTemp: 15 },
    { id: 'living', name: '客厅', icon: 'chair', devices: 6, airQuality: 12, outdoorTemp: 15 },
    { id: 'kitchen', name: '厨房', icon: 'flatware', devices: 2, airQuality: 10, outdoorTemp: 15 },
    { id: 'bath', name: '浴室', icon: 'bathtub', devices: 4, airQuality: 9, outdoorTemp: 15 },
    { id: 'nursery', name: '婴儿房', icon: 'child_care', devices: 5, airQuality: 11, outdoorTemp: 15 },
  ];

  private sensorCache = new Map<string, SensorCacheEntry>();

  constructor(private readonly mqttService: MqttService) {}

  /**
   * 获取所有房间列表
   *
   * @returns 房间数组，附带最新传感器数据
   */
  findAll(): RoomResponse[] {
    return this.rooms.map((room) => {
      const sensor = this.sensorCache.get(room.id);
      return {
        id: room.id,
        name: room.name,
        icon: room.icon,
        currentTemp: sensor?.temp ?? null,
        currentHumi: sensor?.humi ?? null,
        status: sensor?.status ?? 'offline',
        lastUpdate: sensor?.timestamp ?? null,
      };
    });
  }

  /**
   * 获取单个房间详情
   *
   * @param id - 房间标识
   * @returns 房间详情（含设备数和空气质量），若不存在返回 null
   */
  findById(id: string): RoomDetailResponse | null {
    const room = this.rooms.find((r) => r.id === id);
    if (!room) return null;

    const sensor = this.sensorCache.get(room.id);
    return {
      id: room.id,
      name: room.name,
      icon: room.icon,
      currentTemp: sensor?.temp ?? null,
      currentHumi: sensor?.humi ?? null,
      status: sensor?.status ?? 'offline',
      lastUpdate: sensor?.timestamp ?? null,
      devices: room.devices,
      airQuality: room.airQuality,
      outdoorTemp: room.outdoorTemp,
    };
  }

  /**
   * 获取房间历史传感器数据
   *
   * InfluxDB 模块实现前返回模拟数据，用于前端调试
   *
   * @param roomId - 房间标识
   * @param range - 时间范围（1h / 6h / 24h / 7d / 30d）
   * @param _interval - 聚合粒度（分钟），暂未使用
   * @returns 时序数据点数组
   */
  getHistory(roomId: string, range: string, _interval?: number): RoomHistoryPoint[] {
    const count = this.getPointCount(range);
    const baseTemp = 22 + Math.random() * 4;
    const baseHumi = 50 + Math.random() * 10;

    return Array.from({ length: count }, (_, i) => ({
      timestamp: new Date(Date.now() - (count - i) * this.getIntervalMs(range)).toISOString(),
      temp: +(baseTemp + Math.sin(i * 0.3) * 2 + (Math.random() - 0.5) * 1.5).toFixed(1),
      humi: +(baseHumi + Math.cos(i * 0.25) * 5 + (Math.random() - 0.5) * 3).toFixed(0),
    }));
  }

  /**
   * 向指定房间发布空调控制指令
   *
   * 校验参数后通过 MQTT 下发到 ESP32，同时记录操作日志
   *
   * @param roomId - 目标房间标识
   * @param command - 空调控制指令（开关、模式、温度、风速、摆风）
   */
  async controlAc(roomId: string, command: { power: 'on' | 'off'; mode?: string; targetTemp?: number; fanSpeed?: string; swing?: boolean }) {
    const room = this.rooms.find((r) => r.id === roomId);
    if (!room) {
      throw new Error(`Room ${roomId} not found`);
    }

    this.mqttService.publishAcCommand(roomId, {
      deviceId: roomId,
      type: 'command',
      action: 'ac_control',
      payload: {
        power: command.power,
        mode: command.mode as 'cool' | 'heat' | 'fan' | 'auto' | undefined,
        targetTemp: command.targetTemp,
        fanSpeed: command.fanSpeed as 'low' | 'mid' | 'high' | 'auto' | undefined,
        swing: command.swing,
      },
      source: 'manual',
      viaBroker: 'local',
      reason: '用户手动控制',
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`AC control sent to ${roomId}: ${JSON.stringify(command)}`);
  }

  /**
   * 更新房间的传感器缓存数据
   *
   * 由 MqttController 消费传感器消息后调用，供查询接口读取
   *
   * @param roomId - 房间标识
   * @param data - 传感器数据（temp、humi、status、timestamp）
   */
  updateSensorCache(roomId: string, data: { temp: number; humi: number; status: 'online' | 'offline' | 'fault'; timestamp: string }) {
    this.sensorCache.set(roomId, data);
  }

  /**
   * 根据时间范围计算返回的数据点数量
   *
   * @param range - 时间范围标识
   * @returns 数据点数量
   */
  private getPointCount(range: string): number {
    const map: Record<string, number> = {
      '1h': 12,
      '6h': 36,
      '24h': 48,
      '7d': 56,
      '30d': 60,
    };
    return map[range] ?? 48;
  }

  /**
   * 根据时间范围计算数据点间隔（毫秒）
   *
   * @param range - 时间范围标识
   * @returns 间隔毫秒数
   */
  private getIntervalMs(range: string): number {
    const map: Record<string, number> = {
      '1h': 5 * 60 * 1000,
      '6h': 10 * 60 * 1000,
      '24h': 30 * 60 * 1000,
      '7d': 3 * 60 * 60 * 1000,
      '30d': 12 * 60 * 60 * 1000,
    };
    return map[range] ?? 30 * 60 * 1000;
  }
}
