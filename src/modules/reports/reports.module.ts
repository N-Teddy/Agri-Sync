import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Alert } from '../../entities/alert.entity';
import { FieldActivity } from '../../entities/field-activity.entity';
import { FinancialRecord } from '../../entities/financial-record.entity';
import { PlantingSeason } from '../../entities/planting-season.entity';
import { WeatherData } from '../../entities/weather-data.entity';
import { FieldsModule } from '../fields/fields.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            FieldActivity,
            FinancialRecord,
            PlantingSeason,
            WeatherData,
            Alert,
        ]),
        FieldsModule,
    ],
    controllers: [ReportsController],
    providers: [ReportsService],
    exports: [ReportsService],
})
export class ReportsModule { }
