import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import type { DeviceStatusPayload, SensorDataPayload } from '@climelens/shared';
import { MQTT_PATTERNS } from '@climelens/shared';
import { RoomService } from '../room/room.service';
import { SensorGateway } from '../gateway/sensor.gateway';

@Controller()
export class MqttController {
  private readonly logger = new Logger(MqttController.name);

  constructor(
    private readonly roomService: RoomService,
    private readonly sensorGateway: SensorGateway,
  ) {}

  /**
   * 消费所有房间的传感器数据消息
   *
   * 匹配主题 `house/room/+/data`，ESP32 每 30s 上报一次温湿度。
   * 更新 RoomService 传感器缓存，后续写入 InfluxDB 并触发 AI 评估。
   *
   * @param data - 传感器上报载荷（deviceId、temp、humi、battery、rssi 等）
   */
  @EventPattern(MQTT_PATTERNS.SENSOR_DATA)
  handleSensorData(@Payload() data: SensorDataPayload) {
    this.logger.log(
      `Sensor data from ${data.deviceId}: ${data.temp}°C / ${data.humi}% [${data.broker}]`,
    );

    this.roomService.updateSensorCache(data.deviceId, {
      temp: data.temp,
      humi: data.humi,
      status: data.status,
      timestamp: data.timestamp,
    });
    this.sensorGateway.handleSensorUpdate(data);
  }

  /**
   * 消费所有房间的设备状态变更消息
   *
   * 匹配主题 `house/room/+/status`，设备上线/离线/故障时触发
   *
   * @param data - 设备状态载荷（deviceId、status）
   */
  @EventPattern(MQTT_PATTERNS.DEVICE_STATUS)
  handleDeviceStatus(@Payload() data: DeviceStatusPayload) {
    this.logger.log(`Device ${data.deviceId} status: ${data.status}`);

    if (data.status === 'online' || data.status === 'offline' || data.status === 'fault') {
      this.roomService.updateSensorCache(data.deviceId, {
        temp: this.roomService.findById(data.deviceId)?.currentTemp ?? 0,
        humi: this.roomService.findById(data.deviceId)?.currentHumi ?? 0,
        status: data.status,
        timestamp: new Date().toISOString(),
      });
      this.sensorGateway.handleDeviceStatus(data);
    }
  }
}
