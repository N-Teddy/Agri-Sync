import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppConfiguration } from './configuration';
import { join } from 'path';
import { Alert, Field, FieldActivity, FinancialRecord, Plantation, PlantingSeason, User, WeatherData } from 'src/entities';

export const buildTypeOrmConfig = (
  configService: ConfigService<AppConfiguration>,
): TypeOrmModuleOptions => {
  const database = configService.get<AppConfiguration['database']>('database');
  if (!database?.url) {
    throw new Error('Database URL is not configured');
  }

  const app = configService.get<AppConfiguration['app']>('app');
  const isProduction = app?.env === 'production';

  return {
    type: 'postgres',
    url: database.url,
    entities: [
      Alert, Field, FieldActivity, FinancialRecord, Plantation,
      PlantingSeason, User, WeatherData
    ],
    autoLoadEntities: true,
    synchronize: !isProduction,
    logging: !isProduction,
  };
};
