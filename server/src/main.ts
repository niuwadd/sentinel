import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const configService = app.get(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.MQTT,
    options: {
      url: configService.get<string>('broker.local.url', 'mqtt://localhost:1883'),
      username: configService.get<string>('broker.local.username', ''),
      password: configService.get<string>('broker.local.password', ''),
      clientId: `${configService.get<string>('broker.defaults.clientIdPrefix', 'nest_server')}_sub_${Math.random().toString(36).slice(2, 8)}`,
    },
  });

  await app.startAllMicroservices();

  const port = configService.get('PORT', 3000);
  await app.listen(port);
}
bootstrap();
