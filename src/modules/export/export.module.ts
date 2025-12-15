import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FieldActivity } from '../../entities/field-activity.entity';
import { FinancialRecord } from '../../entities/financial-record.entity';
import { PlantingSeason } from '../../entities/planting-season.entity';
import { FieldsModule } from '../fields/fields.module';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			FieldActivity,
			FinancialRecord,
			PlantingSeason,
		]),
		FieldsModule,
	],
	controllers: [ExportController],
	providers: [ExportService],
	exports: [ExportService],
})
export class ExportModule {}
