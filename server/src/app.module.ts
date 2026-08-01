import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { MqttModule } from './mqtt/mqtt.module';
import { RoomModule } from './room/room.module';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [AppConfigModule, MqttModule, RoomModule, GatewayModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
