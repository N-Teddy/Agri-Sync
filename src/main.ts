import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { configureApp } from './common/utils/app-config.util';
import type { AppConfiguration } from './config/configuration';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = configureApp(app);
	const appConfig = configService.get<AppConfiguration['app']>('app');
	const port = appConfig?.port ?? 3000;
	await app.listen(port);
	Logger.log(`Application is running on: http://localhost:${port}`);
	const globalPrefix = appConfig?.globalPrefix ?? 'api';
	Logger.log(
		`API documentation available at: http://localhost:${port}/${globalPrefix}/docs`
	);
}

void bootstrap();
