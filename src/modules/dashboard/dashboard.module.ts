import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Alert } from '../../entities/alert.entity';
import { Field } from '../../entities/field.entity';
import { FieldActivity } from '../../entities/field-activity.entity';
import { WeatherData } from '../../entities/weather-data.entity';
import { FinancialModule } from '../financial/financial.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([Field, FieldActivity, Alert, WeatherData]),
		FinancialModule,
	],
	controllers: [DashboardController],
	providers: [DashboardService],
})
export class DashboardModule {}
