import { Injectable, Inject, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import type { SensorDataPayload, AiDecisionPayload } from '@climelens/shared';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttService.name);
  private connected = false;

  constructor(
    @Inject('MQTT_PUB_CLIENT') private readonly client: ClientProxy,
  ) {}

  /**
   * 模块初始化时自动连接本地 MQTT Broker
   *
   * 连接失败不阻断应用启动，后续 publish 时 ClientProxy 会自动重试
   */
  async onModuleInit() {
    try {
      await this.client.connect();
      this.connected = true;
      this.logger.log('MQTT publish client connected to local broker');
    } catch (error) {
      this.logger.warn('MQTT publish client connection failed, will retry on first publish');
    }
  }

  /**
   * 模块销毁时断开 MQTT 连接，释放资源
   */
  async onModuleDestroy() {
    await this.client.close();
    this.connected = false;
    this.logger.log('MQTT publish client disconnected');
  }

  /**
   * 查询当前 Broker 连接状态
   *
   * @returns connected — true 表示发布客户端已连接到 Broker
   */
  getBrokerHealth(): { connected: boolean } {
    return { connected: this.connected };
  }

  /**
   * 向指定房间的传感器数据主题发布消息
   *
   * 发布到 `house/room/{roomId}/data`，QoS 1，本地 Broker 会通过 Bridge 同步到云端
   *
   * @param roomId - 房间标识，如 "living"、"bedroom"
   * @param data - 传感器数据载荷（温湿度、电量、信号等）
   */
  publishSensorData(roomId: string, data: SensorDataPayload) {
    this.client.emit(`house/room/${roomId}/data`, data);
  }

  /**
   * 向指定房间的空调控制主题发布指令
   *
   * 发布到 `house/room/{roomId}/ac/ctrl`，ESP32 订阅该主题执行红外发射
   *
   * @param roomId - 目标房间标识
   * @param decision - AI 决策载荷，包含控制指令、推理理由、决策来源
   */
  publishAcCommand(roomId: string, decision: AiDecisionPayload) {
    this.client.emit(`house/room/${roomId}/ac/ctrl`, decision);
  }
}
