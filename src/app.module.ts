import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { CommonServicesModule } from './common/services/common-services.module';
import configuration, { AppConfiguration } from './config/configuration';
import { validateEnv } from './config/env.validation';
import { buildTypeOrmConfig } from './config/typeorm.config';
import { AlertsModule } from './modules/alerts/alerts.module';
import { AuthModule } from './modules/auth/auth.module';
import { CropManagementModule } from './modules/crop-management/crop-management.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ExportModule } from './modules/export/export.module';
import { FinancialModule } from './modules/financial/financial.module';
import { HealthModule } from './modules/health/health.module';
import { PlantationsModule } from './modules/plantations/plantations.module';
import { ReportsModule } from './modules/reports/reports.module';
import { WeatherModule } from './modules/weather/weather.module';

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
        const redis =
          configService.get<AppConfiguration['redis']>('redis');
        return {
          redis: {
            host: redis?.host,
            port: redis?.port,
            password: redis?.password,
          },
        };
      },
    }),
    ScheduleModule.forRoot(),
    CommonServicesModule,
    AlertsModule,
    AuthModule,
    HealthModule,
    PlantationsModule,
    CropManagementModule,
    FinancialModule,
    DashboardModule,
    ReportsModule,
    ExportModule,
    WeatherModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }
