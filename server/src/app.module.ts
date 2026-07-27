import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { MqttModule } from './mqtt/mqtt.module';
import { RoomModule } from './room/room.module';

@Module({
  imports: [AppConfigModule, MqttModule, RoomModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
