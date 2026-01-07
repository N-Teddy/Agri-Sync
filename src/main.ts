import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);
	const httpAdapterHost = app.get(HttpAdapterHost);

	const apiBasePath = configService.get<string>('API_BASE_PATH') ?? 'api/v1';
	app.setGlobalPrefix(apiBasePath.replace(/^\/+/, ''));
	app.enableCors({
		origin: configService.get<string>('CORS_ORIGIN') ?? '*',
		credentials: true,
	});

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
			forbidNonWhitelisted: true,
		})
	);
	app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));
	app.useGlobalInterceptors(new ResponseInterceptor());

	await app.listen(configService.get<number>('PORT') ?? 3000);
}
bootstrap();
