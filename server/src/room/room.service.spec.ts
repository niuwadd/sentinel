import type { MqttService } from '../mqtt/mqtt.service';
import type { InfluxService } from '../influx/influx.service';
import { RoomService } from './room.service';

describe('RoomService monitored rooms', () => {
  const publishAcCommand = jest.fn();
  const queryHistory = jest.fn();
  const mqttService = { publishAcCommand } as unknown as MqttService;
  const influxService = { queryHistory } as unknown as InfluxService;
  let service: RoomService;

  beforeEach(() => {
    publishAcCommand.mockReset();
    queryHistory.mockReset();
    service = new RoomService(mqttService, influxService);
  });

  /**
   * 确认房间接口只返回三个卧室和客厅温区。
   *
   * @returns 无返回值。
   */
  it('returns three bedrooms and the living room', () => {
    expect(service.findAll().map((room) => ({ id: room.id, hasAc: room.hasAc }))).toEqual([
      { id: 'bedroom-a', hasAc: true },
      { id: 'nursery', hasAc: true },
      { id: 'bedroom', hasAc: true },
      { id: 'living', hasAc: false },
    ]);
  });

  /**
   * 确认客厅虽然监测温度，但不能下发空调控制命令。
   *
   * @returns 拒绝结果断言。
   */
  it('rejects air-conditioner control for the living room', async () => {
    await expect(service.controlAc('living', { power: 'on' })).rejects.toThrow(
      'Room living has no air conditioner',
    );
  });

  /**
   * 确认新增卧室 A 可以正常下发空调控制命令。
   *
   * @returns Promise 完成后无返回值。
   */
  it('allows air-conditioner control for bedroom A', async () => {
    await service.controlAc('bedroom-a', { power: 'on' });

    expect(publishAcCommand).toHaveBeenCalledWith(
      'bedroom-a',
      expect.objectContaining({ deviceId: 'bedroom-a' }),
    );
  });

  /**
   * 确认历史数据查询委托给 InfluxDB 模块。
   *
   * @returns Promise 完成后无返回值。
   */
  it('queries history from influxdb', async () => {
    queryHistory.mockResolvedValue([
      { timestamp: '2026-08-02T00:00:00.000Z', temp: 24.1, humi: 50 },
    ]);

    const history = await service.getHistory('living', '24h');

    expect(queryHistory).toHaveBeenCalledWith('living', '24h');
    expect(history).toEqual([
      { timestamp: '2026-08-02T00:00:00.000Z', temp: 24.1, humi: 50 },
    ]);
  });
});
