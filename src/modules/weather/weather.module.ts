import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Alert } from '../../entities/alert.entity';
import { WeatherData } from '../../entities/weather-data.entity';

import { FieldsModule } from '../fields/fields.module';
import { WeatherAlertsService } from './weather-alerts.service';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([WeatherData, Alert]),
    FieldsModule,
  ],
  controllers: [WeatherController],
  providers: [WeatherService, WeatherAlertsService],
})
export class WeatherModule { }
