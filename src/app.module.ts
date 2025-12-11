import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import configuration, { AppConfiguration } from './config/configuration';
import { validateEnv } from './config/env.validation';
import { buildTypeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './modules/auth/auth.module';
import { CropManagementModule } from './modules/crop-management/crop-management.module';
import { HealthModule } from './modules/health/health.module';
import { PlantationsModule } from './modules/plantations/plantations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [configuration],
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfiguration>) =>
        buildTypeOrmConfig(configService),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfiguration>) => {
        const redis = configService.get<AppConfiguration['redis']>('redis');
        return {
          redis: {
            host: redis?.host,
            port: redis?.port,
            password: redis?.password,
          },
        };
      },
    }),
    AuthModule,
    HealthModule,
    PlantationsModule,
    CropManagementModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }
