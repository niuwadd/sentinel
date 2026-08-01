import { SensorGateway } from './sensor.gateway';
import type {
  AiDecisionPayload,
  DeviceStatusPayload,
  SensorDataPayload,
} from '@climelens/shared';

interface MockServer {
  emit: jest.Mock;
}

describe('SensorGateway', () => {
  let gateway: SensorGateway;
  let server: MockServer;

  beforeEach(() => {
    gateway = new SensorGateway();
    server = { emit: jest.fn() };
  });

  /**
   * 确认传感器数据到达时向所有 WebSocket 客户端广播 sensor:update 事件。
   *
   * @returns 无返回值。
   */
  it('broadcasts sensor updates to connected clients', () => {
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

    gateway.afterInit(server as never);
    gateway.handleSensorUpdate(data);

    expect(server.emit).toHaveBeenCalledWith('sensor:update', data);
  });

  /**
   * 确认设备状态变更时广播 device:status 事件。
   *
   * @returns 无返回值。
   */
  it('broadcasts device status changes to connected clients', () => {
    const status = { deviceId: 'bedroom-a', status: 'offline' } as DeviceStatusPayload;

    gateway.afterInit(server as never);
    gateway.handleDeviceStatus(status);

    expect(server.emit).toHaveBeenCalledWith('device:status', status);
  });

  /**
   * 确认 AI 决策产生时广播 ai:decision 事件。
   *
   * @returns 无返回值。
   */
  it('broadcasts AI decisions to connected clients', () => {
    const decision = {
      deviceId: 'bedroom-a',
      type: 'command',
      action: 'ac_control',
      payload: { power: 'on' },
      source: 'ai_agent',
      viaBroker: 'local',
      reason: '温度偏低',
      timestamp: '2026-08-01T00:00:00.000Z',
    } as AiDecisionPayload;

    gateway.afterInit(server as never);
    gateway.handleAiDecision(decision);

    expect(server.emit).toHaveBeenCalledWith('ai:decision', decision);
  });
});
