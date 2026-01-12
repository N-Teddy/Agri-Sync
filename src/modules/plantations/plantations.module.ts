import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Field } from '../../entities/field.entity';
import { Plantation } from '../../entities/plantation.entity';
import { SyncModule } from '../sync/sync.module';
import { PlantationFieldsController } from './plantation-fields.controller';
import { PlantationFieldsService } from './plantation-fields.service';
import { PlantationsController } from './plantations.controller';
import { PlantationsService } from './plantations.service';

@Module({
	imports: [TypeOrmModule.forFeature([Plantation, Field]), SyncModule],
	controllers: [PlantationsController, PlantationFieldsController],
	providers: [PlantationsService, PlantationFieldsService],
})
export class PlantationsModule {}
