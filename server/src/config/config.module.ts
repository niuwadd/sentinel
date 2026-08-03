import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { brokerConfig } from './broker.config';
import { databaseConfig } from './database.config';
import { aiConfig } from './ai.config';
import { validate } from './env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
      load: [brokerConfig, databaseConfig, aiConfig],
      validate,
    }),
  ],
})
export class AppConfigModule {}
