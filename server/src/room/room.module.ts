import { Module, forwardRef } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { MqttModule } from '../mqtt/mqtt.module';
import { InfluxModule } from '../influx/influx.module';

@Module({
  imports: [forwardRef(() => MqttModule), InfluxModule],
  controllers: [RoomController],
  providers: [RoomService],
  exports: [RoomService],
})
export class RoomModule {}
