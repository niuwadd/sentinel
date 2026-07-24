import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { brokerConfig } from './broker.config.js';
import { databaseConfig } from './database.config.js';
import { aiConfig } from './ai.config.js';
import { validate } from './env.validation.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      load: [brokerConfig, databaseConfig, aiConfig],
      validate,
    }),
  ],
})
export class AppConfigModule {}
