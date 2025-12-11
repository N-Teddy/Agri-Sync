import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Field } from '../../entities/field.entity';
import { FieldActivity } from '../../entities/field-activity.entity';
import { PlantingSeason } from '../../entities/planting-season.entity';

import { FieldsModule } from '../fields/fields.module';
import { FieldActivitiesController } from './field-activities.controller';
import { FieldActivitiesService } from './field-activities.service';
import { PlantingSeasonsController } from './planting-seasons.controller';
import { PlantingSeasonsService } from './planting-seasons.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Field, PlantingSeason, FieldActivity]),
    FieldsModule,
  ],
  controllers: [PlantingSeasonsController, FieldActivitiesController],
  providers: [
    PlantingSeasonsService,
    FieldActivitiesService,
  ],
})
export class CropManagementModule { }
