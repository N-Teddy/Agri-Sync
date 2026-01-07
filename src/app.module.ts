import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SupabaseAuthGuard } from './common/guards/supabase-auth.guard';
import { envValidationSchema } from './config/env.validation';
import { HealthModule } from './modules/health/health.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			validationSchema: envValidationSchema,
		}),
		TypeOrmModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				type: 'postgres',
				url: configService.get<string>('DATABASE_URL'),
				autoLoadEntities: true,
				synchronize: false,
			}),
		}),
		HealthModule,
	],
	controllers: [],
	providers: [
		{
			provide: APP_GUARD,
			useClass: SupabaseAuthGuard,
		},
	],
})
export class AppModule {}
