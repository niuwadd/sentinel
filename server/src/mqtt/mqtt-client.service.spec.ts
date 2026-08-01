import { EventEmitter } from 'node:events';
import type { MqttClient } from 'mqtt';

jest.mock('mqtt', () => ({
  __esModule: true,
  default: {
    connect: jest.fn(),
  },
}));

import mqtt from 'mqtt';
import { MqttService } from '../../../client/src/services/mqtt.service';

/**
 * 创建可触发 MQTT 事件的测试客户端。
 *
 * @returns 满足 MqttClient 接口的内存事件客户端。
 */
function createMqttClient(): MqttClient {
  return Object.assign(new EventEmitter(), {
    end: jest.fn(),
    subscribe: jest.fn(),
  }) as unknown as MqttClient;
}

/**
 * 向测试客户端发出 MQTT message 事件。
 *
 * @param client - 需要触发事件的 MQTT 测试客户端。
 * @param topic - MQTT 消息主题。
 * @param payload - MQTT 原始消息载荷。
 * @returns 无返回值。
 */
function emitMessage(client: MqttClient, topic: string, payload: Buffer) {
  (client as unknown as EventEmitter).emit('message', topic, payload);
}

describe('MqttService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  /**
   * 将设备状态主题分发给已注册的状态处理器。
   *
   * @returns 无返回值。
   */
  it('forwards device status messages to the registered handler', () => {
    const service = new MqttService();
    const localClient = createMqttClient();
    const connect = jest.mocked(mqtt.connect);
    const statuses: Array<{
      deviceId: string;
      status: 'online' | 'offline' | 'fault';
    }> = [];

    connect.mockReturnValueOnce(localClient);
    service.subscribe({
      onSensorData: jest.fn(),
      onAiDecision: jest.fn(),
      onDeviceStatus: (status) => statuses.push(status),
    });

    service.connect('local');
    emitMessage(
      localClient,
      'house/room/living/status',
      Buffer.from(JSON.stringify({ deviceId: 'living', status: 'offline' })),
    );
    service.disconnect();

    expect(statuses).toEqual([{ deviceId: 'living', status: 'offline' }]);
  });

  /**
   * 本地 Broker 在建立连接后断开时，应切换到云端 Broker。
   *
   * @returns 无返回值。
   */
  it('falls back to the cloud broker after the local broker disconnects', () => {
    jest.useFakeTimers();
    const service = new MqttService();
    const localClient = createMqttClient();
    const cloudClient = createMqttClient();
    const connect = jest.mocked(mqtt.connect);

    connect.mockReturnValueOnce(localClient).mockReturnValueOnce(cloudClient);

    service.connect('local');
    localClient.emit('close');
    jest.advanceTimersByTime(5000);

    expect(connect).toHaveBeenCalledTimes(2);
    expect(connect).toHaveBeenLastCalledWith(
      'wss://cloud.emqx.io:8084/mqtt',
      expect.any(Object),
    );

    jest.useRealTimers();
  });
});
