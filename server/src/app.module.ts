import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module.js';
import { MqttModule } from './mqtt/mqtt.module.js';

@Module({
  imports: [AppConfigModule, MqttModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
