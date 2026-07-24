import { registerAs } from '@nestjs/config';
import * as process from 'process';

export const databaseConfig = registerAs('database', () => ({
  postgres: {
    url: process.env.DATABASE_URL ?? '',
  },
  influxdb: {
    url: process.env.INFLUXDB_URL ?? 'http://localhost:8086',
    token: process.env.INFLUXDB_TOKEN ?? '',
    org: process.env.INFLUXDB_ORG ?? 'climelens',
    bucket: process.env.INFLUXDB_BUCKET ?? 'sensors',
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  },
}));
