import { registerAs } from '@nestjs/config';
import * as process from 'process';

export const brokerConfig = registerAs('broker', () => ({
  cloud: {
    url: process.env.CLOUD_MQTT_URL ?? 'mqtts://cloud.emqx.io:8883',
    username: process.env.CLOUD_MQTT_USERNAME ?? '',
    password: process.env.CLOUD_MQTT_PASSWORD ?? '',
  },
  local: {
    url: process.env.LOCAL_MQTT_URL ?? 'mqtt://localhost:1883',
    wsUrl: process.env.LOCAL_MQTT_WS_URL ?? 'ws://localhost:8083/mqtt',
    username: process.env.LOCAL_MQTT_USERNAME ?? '',
    password: process.env.LOCAL_MQTT_PASSWORD ?? '',
  },
  defaults: {
    qos: 1 as 0 | 1 | 2,
    keepalive: 60,
    clientIdPrefix: 'nest_server',
  },
}));
