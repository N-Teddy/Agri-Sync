import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ActivityPhoto } from '../../entities/activity-photo.entity';
import { Field } from '../../entities/field.entity';
import { FieldActivity } from '../../entities/field-activity.entity';
import { PlantingSeason } from '../../entities/planting-season.entity';
import { FieldsModule } from '../fields/fields.module';
import { FinancialModule } from '../financial/financial.module';
import { ActivityPhotosController } from './activity-photos.controller';
import { ActivityPhotosService } from './activity-photos.service';
import { FieldActivitiesController } from './field-activities.controller';
import { FieldActivitiesService } from './field-activities.service';
import { PlantingSeasonsController } from './planting-seasons.controller';
import { PlantingSeasonsService } from './planting-seasons.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Field,
			PlantingSeason,
			FieldActivity,
			ActivityPhoto,
		]),
		FieldsModule,
		FinancialModule,
	],
	controllers: [
		PlantingSeasonsController,
		FieldActivitiesController,
		ActivityPhotosController,
	],
	providers: [
		PlantingSeasonsService,
		FieldActivitiesService,
		ActivityPhotosService,
	],
})
export class CropManagementModule {}
