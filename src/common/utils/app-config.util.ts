import type { INestApplication } from '@nestjs/common';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { SwaggerCustomOptions } from '@nestjs/swagger';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import type { AppConfiguration } from '../../config/configuration';
import { AllExceptionsFilter } from '../filters/http-exception.filter';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { ResponseInterceptor } from '../interceptors/response.interceptor';

export const configureApp = (
	app: INestApplication
): ConfigService<AppConfiguration> => {
	const configService =
		app.get<ConfigService<AppConfiguration>>(ConfigService);
	const appConfig = configService.get<AppConfiguration['app']>('app');
	const globalPrefix = appConfig?.globalPrefix ?? 'api';
	const apiVersion = appConfig?.apiVersion ?? '1';

	app.setGlobalPrefix(globalPrefix);
	app.enableVersioning({
		type: VersioningType.URI,
		defaultVersion: apiVersion,
	});

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
			transformOptions: { enableImplicitConversion: true },
		})
	);

	app.useGlobalFilters(new AllExceptionsFilter());
	app.useGlobalInterceptors(
		new LoggingInterceptor(),
		new ResponseInterceptor()
	);
	app.use(helmet());

	const documentConfig = new DocumentBuilder()
		.setTitle(appConfig?.name ?? 'Agri Sync Pro')
		.setDescription('Agri Sync API documentation')
		.setVersion(apiVersion)
		.addBearerAuth()
		.build();

	const document = SwaggerModule.createDocument(app, documentConfig);

	const customOptions: SwaggerCustomOptions = {
		swaggerOptions: {
			persistAuthorization: true,
		},
		customCssUrl:
			'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
		customJs: [
			'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
			'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
		],
	};

	SwaggerModule.setup(`${globalPrefix}/docs`, app, document, customOptions);

	return configService;
};
