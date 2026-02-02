import type { INestApplication } from '@nestjs/common';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { SwaggerCustomOptions } from '@nestjs/swagger';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import helmet from 'helmet';
import { join } from 'path';

import type { AppConfiguration } from '../../config/configuration';
import { AllExceptionsFilter } from '../filters/http-exception.filter';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { ResponseInterceptor } from '../interceptors/response.interceptor';

export const configureApp = (
	app: INestApplication & NestExpressApplication
): ConfigService<AppConfiguration> => {
	const configService =
		app.get<ConfigService<AppConfiguration>>(ConfigService);
	const appConfig = configService.get<AppConfiguration['app']>('app');
	const storageConfig =
		configService.get<AppConfiguration['storage']>('storage');
	const globalPrefix = appConfig?.globalPrefix ?? 'api';
	const apiVersion = appConfig?.apiVersion ?? '1';
	const allowedOrigins =
		appConfig?.webUrl
			?.split(',')
			.map((origin) => origin.trim())
			.filter(Boolean) ?? [];
	const uploadsDirConfig = storageConfig?.uploadsDir ?? 'uploads';
	const uploadsDir = uploadsDirConfig.startsWith('/')
		? uploadsDirConfig
		: join(process.cwd(), uploadsDirConfig);

	app.setGlobalPrefix(globalPrefix);
	app.enableVersioning({
		type: VersioningType.URI,
		defaultVersion: apiVersion,
	});
	app.enableCors({
		origin: allowedOrigins.length > 0 ? allowedOrigins : true,
		credentials: true,
	});
	app.useStaticAssets(uploadsDir, {
		prefix: '/uploads/',
	});
	const baseWebUrl = appConfig?.webUrl?.replace(/\/$/, '') ?? '';
	const httpAdapter = app.getHttpAdapter();
	const httpInstance = httpAdapter.getInstance();
	if (httpInstance?.get) {
		httpInstance.get('/', (req: Request, res: Response) => {
			const token =
				typeof req.query.token === 'string'
					? req.query.token
					: undefined;
			if (token && baseWebUrl) {
				return res.redirect(
					302,
					`${baseWebUrl}/verify-email?token=${encodeURIComponent(token)}`
				);
			}
			return res.status(200).json({ status: 'ok' });
		});
	}

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
