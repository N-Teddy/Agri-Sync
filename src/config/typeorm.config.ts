import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SupabaseConnectionService } from 'src/common/third-party/supabase-connection.service';
import { Alert, Field, FieldActivity, FinancialRecord, Plantation, PlantingSeason, User, WeatherData } from 'src/entities';
import { AppConfiguration } from './configuration';

export const buildTypeOrmConfig = (
  configService: ConfigService<AppConfiguration>,
): TypeOrmModuleOptions => {
  const database = configService.get<AppConfiguration['database']>('database');
  const app = configService.get<AppConfiguration['app']>('app');
  const isProduction = app?.env === 'production';
  const supabaseConnectionService = new SupabaseConnectionService(
    configService,
  );

  const connectionUrl = isProduction
    ? supabaseConnectionService.getDatabaseUrl()
    : database?.url;

  if (!connectionUrl) {
    throw new Error('Database URL is not configured');
  }

  return {
    type: 'postgres',
    url: connectionUrl,
    entities: [
      Alert, Field, FieldActivity, FinancialRecord, Plantation,
      PlantingSeason, User, WeatherData
    ],
    autoLoadEntities: true,
    synchronize: !isProduction,
    logging: !isProduction,
    ssl: isProduction ? { rejectUnauthorized: false } : undefined,
  };
};
