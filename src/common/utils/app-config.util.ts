import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AllExceptionsFilter } from '../filters/http-exception.filter';
import { ResponseInterceptor } from '../interceptors/response.interceptor';

export const configureApp = async (
  app: INestApplication,
): Promise<ConfigService> => {
  const configService = app.get(ConfigService);
  const globalPrefix =
    configService.get<string>('app.globalPrefix') ?? 'api';
  const apiVersion = configService.get<string>('app.apiVersion') ?? '1';

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
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.use(helmet());

  const documentConfig = new DocumentBuilder()
    .setTitle(configService.get<string>('app.name') ?? 'Agri Sync Pro')
    .setDescription('Agri Sync API documentation')
    .setVersion(apiVersion)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, documentConfig);
  SwaggerModule.setup(`${globalPrefix}/docs`, app, document);

  return configService;
};
