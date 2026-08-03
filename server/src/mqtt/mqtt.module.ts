import { Module, forwardRef } from '@nestjs/common';
import { MqttController } from './mqtt.controller';
import { MqttService } from './mqtt.service';
import { RoomModule } from '../room/room.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GatewayModule } from '../gateway/gateway.module';
import { InfluxModule } from '../influx/influx.module';

@Module({
  imports: [
    forwardRef(() => RoomModule),
    GatewayModule,
    InfluxModule,
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
