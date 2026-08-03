import { buildHistoryQuery, buildSensorPoint } from './influx.service';

describe('InfluxService helpers', () => {
  /**
   * 确认传感器数据点包含房间标签和全部传感器字段。
   *
   * @returns 无返回值。
   */
  it('builds a sensor point with room tag and sensor fields', () => {
    const point = buildSensorPoint('living', {
      temp: 25.4,
      humi: 48,
      heatIndex: 25.1,
      battery: 90,
      rssi: -40,
      timestamp: '2026-08-02T00:00:00.000Z',
    });

    const line = point.toLineProtocol() ?? '';
    expect(line).toContain('room_sensor,room_id=living');
    expect(line).toContain('temp=25.4');
    expect(line).toContain('humi=48');
    expect(line).toContain('heat_index=25.1');
    expect(line).toContain('rssi=-40');
  });

  /**
   * 确认历史查询按房间过滤并按范围聚合。
   *
   * @returns 无返回值。
   */
  it('builds a flux query filtered by room and aggregated per range', () => {
    const flux = buildHistoryQuery('sensors', 'living', '24h');

    expect(flux).toContain('from(bucket: "sensors")');
    expect(flux).toContain('r._measurement == "room_sensor"');
    expect(flux).toContain('r.room_id == "living"');
    expect(flux).toContain('aggregateWindow(every: 10m, fn: mean, createEmpty: false)');
  });
});
