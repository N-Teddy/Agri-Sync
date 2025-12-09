import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './common/utils/app-config.util';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = await configureApp(app);
  const port = configService.get<number>('app.port') ?? 3000;
  await app.listen(port);
  Logger.log(`Application is running on: http://localhost:${port}`);
  Logger.log(`API documentation available at: http://localhost:${port}/${configService.get<string>('app.globalPrefix') ?? 'api'}/docs`);
}

bootstrap();
