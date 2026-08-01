import { Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, type OnGatewayInit } from '@nestjs/websockets';
import { Server } from 'socket.io';
import type {
  AiDecisionPayload,
  DeviceStatusPayload,
  SensorDataPayload,
} from '@climelens/shared';

/**
 * WebSocket 网关 — 向浏览器推送传感器更新与 AI 决策
 *
 * MQTT 控制器收到设备上报后调用对应方法，事件广播给所有已连接客户端。
 */
@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class SensorGateway implements OnGatewayInit {
  private readonly logger = new Logger(SensorGateway.name);

  @WebSocketServer()
  server!: Server;

  /**
   * 网关初始化完成后保存 Socket.IO 服务器实例。
   *
   * @param server - Socket.IO 服务器实例。
   * @returns 无返回值。
   */
  afterInit(server: Server) {
    this.server = server;
    this.logger.log('Sensor WebSocket gateway initialized');
  }

  /**
   * 向所有客户端广播传感器数据更新。
   *
   * @param data - 传感器数据载荷（deviceId、温湿度、状态等）。
   * @returns 无返回值。
   */
  handleSensorUpdate(data: SensorDataPayload) {
    this.server.emit('sensor:update', data);
  }

  /**
   * 向所有客户端广播设备在线状态变更。
   *
   * @param data - 设备状态载荷（deviceId、status）。
   * @returns 无返回值。
   */
  handleDeviceStatus(data: DeviceStatusPayload) {
    this.server.emit('device:status', data);
  }

  /**
   * 向所有客户端广播 AI 决策日志。
   *
   * @param decision - AI 决策载荷（指令、理由、来源等）。
   * @returns 无返回值。
   */
  handleAiDecision(decision: AiDecisionPayload) {
    this.server.emit('ai:decision', decision);
  }
}
