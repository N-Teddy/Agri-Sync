import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './common/utils/app-config.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = await configureApp(app);
  const port = configService.get<number>('app.port') ?? 3000;
  await app.listen(port);
}

bootstrap();
