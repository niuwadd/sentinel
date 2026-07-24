import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MqttController } from './mqtt.controller.js';
import { MqttService } from './mqtt.service.js';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'MQTT_PUB_CLIENT',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.MQTT,
          options: {
            url: configService.get<string>('broker.local.url', 'mqtt://localhost:1883'),
            username: configService.get<string>('broker.local.username', ''),
            password: configService.get<string>('broker.local.password', ''),
            clientId: `${configService.get<string>('broker.defaults.clientIdPrefix', 'nest_server')}_pub_${Math.random().toString(36).slice(2, 8)}`,
          },
        }),
      },
    ]),
  ],
  controllers: [MqttController],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}
