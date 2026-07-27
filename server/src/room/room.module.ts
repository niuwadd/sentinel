import { Module, forwardRef } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { MqttModule } from '../mqtt/mqtt.module';

@Module({
  imports: [forwardRef(() => MqttModule)],
  controllers: [RoomController],
  providers: [RoomService],
  exports: [RoomService],
})
export class RoomModule {}
