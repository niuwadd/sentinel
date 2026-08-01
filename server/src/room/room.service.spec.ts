import type { MqttService } from '../mqtt/mqtt.service';
import { RoomService } from './room.service';

describe('RoomService monitored rooms', () => {
  const publishAcCommand = jest.fn();
  const mqttService = { publishAcCommand } as unknown as MqttService;
  let service: RoomService;

  beforeEach(() => {
    publishAcCommand.mockReset();
    service = new RoomService(mqttService);
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
});
