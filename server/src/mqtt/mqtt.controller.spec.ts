import { MqttController } from './mqtt.controller';
import type { RoomService } from '../room/room.service';
import type { SensorGateway } from '../gateway/sensor.gateway';
import type { SensorDataPayload } from '@climelens/shared';

describe('MqttController gateway wiring', () => {
  const updateSensorCache = jest.fn();
  const findById = jest.fn();
  const handleSensorUpdate = jest.fn();
  const handleDeviceStatus = jest.fn();

  const roomService = { updateSensorCache, findById } as unknown as RoomService;
  const gateway = { handleSensorUpdate, handleDeviceStatus } as unknown as SensorGateway;
  let controller: MqttController;

  beforeEach(() => {
    jest.clearAllMocks();
    findById.mockReturnValue(undefined);
    controller = new MqttController(roomService, gateway);
  });

  /**
   * 确认 MQTT 传感器消息写入缓存后同步推送给 WebSocket 客户端。
   *
   * @returns 无返回值。
   */
  it('broadcasts sensor data through the gateway after caching it', () => {
    const data = {
      deviceId: 'living',
      type: 'sensor',
      temp: 24.2,
      humi: 51,
      heatIndex: 24,
      battery: 82,
      rssi: -54,
      broker: 'local',
      status: 'online',
      timestamp: '2026-08-01T00:00:00.000Z',
    } as SensorDataPayload;

    controller.handleSensorData(data);

    expect(updateSensorCache).toHaveBeenCalledWith(
      'living',
      expect.objectContaining({ temp: 24.2, humi: 51 }),
    );
    expect(handleSensorUpdate).toHaveBeenCalledWith(data);
  });

  /**
   * 确认设备状态消息同样经网关推送给 WebSocket 客户端。
   *
   * @returns 无返回值。
   */
  it('broadcasts device status through the gateway', () => {
    controller.handleDeviceStatus({ deviceId: 'bedroom-a', status: 'offline' });

    expect(handleDeviceStatus).toHaveBeenCalledWith({
      deviceId: 'bedroom-a',
      status: 'offline',
    });
  });
});
