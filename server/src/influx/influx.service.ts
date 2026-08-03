import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  InfluxDB,
  Point,
  type FluxTableMetaData,
  type QueryApi,
  type WriteApi,
} from '@influxdata/influxdb-client';

export interface SensorRecord {
  temp: number;
  humi: number;
  heatIndex?: number;
  battery?: number;
  rssi?: number;
  timestamp: string;
}

export interface HistoryPoint {
  timestamp: string;
  temp: number;
  humi: number;
}

interface InfluxConfig {
  url: string;
  token: string;
  org: string;
  bucket: string;
}

const RANGE_WINDOWS: Record<string, string> = {
  '1h': '1m',
  '6h': '5m',
  '24h': '10m',
  '7d': '1h',
  '30d': '6h',
};

/**
 * 将传感器读数构造成 InfluxDB 时序数据点。
 *
 * @param roomId - 房间标识，写入 tag room_id。
 * @param data - 传感器读数（温湿度必填，其余可选）。
 * @returns 可写入 InfluxDB 的 Point。
 */
export function buildSensorPoint(roomId: string, data: SensorRecord): Point {
  const point = new Point('room_sensor')
    .tag('room_id', roomId)
    .floatField('temp', data.temp)
    .floatField('humi', data.humi);

  if (data.heatIndex != null) point.floatField('heat_index', data.heatIndex);
  if (data.battery != null) point.floatField('battery', data.battery);
  if (data.rssi != null) point.floatField('rssi', data.rssi);
  point.timestamp(new Date(data.timestamp));
  return point;
}

/**
 * 构造按房间过滤并按范围聚合的 Flux 查询。
 *
 * @param bucket - InfluxDB 存储桶名称。
 * @param roomId - 目标房间标识。
 * @param range - 时间范围（1h / 6h / 24h / 7d / 30d）。
 * @returns Flux 查询字符串。
 */
export function buildHistoryQuery(bucket: string, roomId: string, range: string): string {
  const every = RANGE_WINDOWS[range] ?? RANGE_WINDOWS['24h'];
  return `
from(bucket: "${bucket}")
  |> range(start: -${range})
  |> filter(fn: (r) => r._measurement == "room_sensor" and r.room_id == "${roomId}" and (r._field == "temp" or r._field == "humi"))
  |> aggregateWindow(every: ${every}, fn: mean, createEmpty: false)
  |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
  |> keep(columns: ["_time", "temp", "humi"])
  |> sort(columns: ["_time"])`;
}

@Injectable()
export class InfluxService {
  private readonly logger = new Logger(InfluxService.name);
  private readonly queryApi: QueryApi;
  private readonly writeApi: WriteApi;
  private readonly config: InfluxConfig;

  /**
   * 初始化 InfluxDB 客户端连接。
   *
   * @param configService - NestJS 配置服务，读取 database.influxdb 配置。
   */
  constructor(configService: ConfigService) {
    this.config = configService.get<InfluxConfig>('database.influxdb', {
      url: 'http://localhost:8086',
      token: '',
      org: 'climelens',
      bucket: 'sensors',
    });

    const client = new InfluxDB({ url: this.config.url, token: this.config.token });
    this.queryApi = client.getQueryApi(this.config.org);
    this.writeApi = client.getWriteApi(this.config.org, this.config.bucket, 'ms');
  }

  /**
   * 写入一条房间传感器时序数据。
   *
   * @param roomId - 房间标识。
   * @param data - 传感器读数。
   * @returns 无返回值。
   */
  writeSensorData(roomId: string, data: SensorRecord) {
    try {
      this.writeApi.writePoint(buildSensorPoint(roomId, data));
      this.writeApi.flush().catch(() => undefined);
    } catch (err) {
      this.logger.warn(`InfluxDB write failed: ${(err as Error).message}`);
    }
  }

  /**
   * 查询指定房间在时间范围内的温湿度历史。
   *
   * @param roomId - 目标房间标识。
   * @param range - 时间范围（1h / 6h / 24h / 7d / 30d）。
   * @returns 按时间升序的温湿度数据点数组。
   * @throws InfluxDB 查询失败时抛出异常。
   */
  queryHistory(roomId: string, range: string): Promise<HistoryPoint[]> {
    const flux = buildHistoryQuery(this.config.bucket, roomId, range);
    return new Promise((resolve, reject) => {
      const points: HistoryPoint[] = [];
      this.queryApi.queryRows(flux, {
        next: (row: string[], tableMeta: FluxTableMetaData) => {
          const values = tableMeta.toObject(row);
          const temp = Number(values.temp);
          const humi = Number(values.humi);
          if (values._time && !Number.isNaN(temp) && !Number.isNaN(humi)) {
            points.push({
              timestamp: String(values._time),
              temp,
              humi,
            });
          }
        },
        error: (err: Error) => reject(err),
        complete: () => resolve(points),
      });
    });
  }
}
