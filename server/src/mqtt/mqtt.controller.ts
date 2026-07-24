import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import type { SensorDataPayload } from '@climelens/shared';
import { MQTT_PATTERNS } from '@climelens/shared';

@Controller()
export class MqttController {
  private readonly logger = new Logger(MqttController.name);

  /**
   * 消费所有房间的传感器数据消息
   *
   * 匹配主题 `house/room/+/data`，ESP32 每 30s 上报一次温湿度
   * 后续链路：写入 InfluxDB → WebSocket 推送前端 → 触发 AI Agent 评估
   *
   * @param data - 传感器上报载荷（deviceId、temp、humi、battery、rssi 等）
   */
  @EventPattern(MQTT_PATTERNS.SENSOR_DATA)
  handleSensorData(@Payload() data: SensorDataPayload) {
    this.logger.log(
      `Sensor data from ${data.deviceId}: ${data.temp}°C / ${data.humi}% [${data.broker}]`,
    );
  }

  /**
   * 消费所有房间的设备状态变更消息
   *
   * 匹配主题 `house/room/+/status`，设备上线/离线/故障时触发
   * 后续链路：更新设备在线状态缓存 → WebSocket 推送前端
   *
   * @param data - 设备状态载荷（deviceId、status）
   */
  @EventPattern(MQTT_PATTERNS.DEVICE_STATUS)
  handleDeviceStatus(@Payload() data: { deviceId: string; status: string }) {
    this.logger.log(`Device ${data.deviceId} status: ${data.status}`);
  }
}
