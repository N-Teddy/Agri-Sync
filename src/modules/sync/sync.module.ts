import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ActivityPhoto } from '../../entities/activity-photo.entity';
import { Field } from '../../entities/field.entity';
import { FieldActivity } from '../../entities/field-activity.entity';
import { FinancialRecord } from '../../entities/financial-record.entity';
import { Plantation } from '../../entities/plantation.entity';
import { PlantingSeason } from '../../entities/planting-season.entity';
import { SyncTombstone } from '../../entities/sync-tombstone.entity';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Plantation,
			Field,
			PlantingSeason,
			FieldActivity,
			FinancialRecord,
			ActivityPhoto,
			SyncTombstone,
		]),
	],
	controllers: [SyncController],
	providers: [SyncService],
	exports: [SyncService],
})
export class SyncModule {}
