import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Alert } from '../../entities/alert.entity';
import { Field } from '../../entities/field.entity';
import { WeatherData } from '../../entities/weather-data.entity';
import { FieldsModule } from '../fields/fields.module';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { WeatherAlertsService } from './weather-alerts.service';
import { WeatherCronService } from './weather-cron.service';

@Module({
	imports: [
		HttpModule,
		TypeOrmModule.forFeature([WeatherData, Alert, Field]),
		FieldsModule,
	],
	controllers: [WeatherController],
	providers: [WeatherService, WeatherAlertsService, WeatherCronService],
})
export class WeatherModule {}
