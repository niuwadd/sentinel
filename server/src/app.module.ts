import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { MqttModule } from './mqtt/mqtt.module';
import { RoomModule } from './room/room.module';
import { GatewayModule } from './gateway/gateway.module';
import { InfluxModule } from './influx/influx.module';

@Module({
  imports: [AppConfigModule, MqttModule, RoomModule, GatewayModule, InfluxModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
