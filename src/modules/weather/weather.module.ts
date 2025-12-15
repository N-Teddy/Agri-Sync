import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Alert } from '../../entities/alert.entity';
import { Field } from '../../entities/field.entity';
import { WeatherData } from '../../entities/weather-data.entity';
import { EmailModule } from '../email/email.module';
import { FieldsModule } from '../fields/fields.module';
import { WeatherAlertsService } from './weather-alerts.service';
import { WeatherController } from './weather.controller';
import { WeatherCronService } from './weather-cron.service';
import { WeatherService } from './weather.service';

@Module({
	imports: [
		HttpModule,
		TypeOrmModule.forFeature([WeatherData, Field, Alert]),
		EmailModule,
		FieldsModule,
	],
	controllers: [WeatherController],
	providers: [WeatherService, WeatherAlertsService, WeatherCronService],
	exports: [WeatherService, WeatherAlertsService],
})
export class WeatherModule {}
