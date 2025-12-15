import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Alert } from '../../entities/alert.entity';
import { FieldsModule } from '../fields/fields.module';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';

@Module({
	imports: [TypeOrmModule.forFeature([Alert]), FieldsModule],
	controllers: [AlertsController],
	providers: [AlertsService],
	exports: [AlertsService],
})
export class AlertsModule {}
