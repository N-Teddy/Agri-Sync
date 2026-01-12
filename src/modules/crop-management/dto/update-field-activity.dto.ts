import { ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsDateString,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
	IsUUID,
	MaxLength,
	Min,
} from 'class-validator';

import { ActivityType } from '../../../common/enums/activity-type.enum';

export class UpdateFieldActivityDto {
	@ApiPropertyOptional({
		enum: ActivityType,
		example: ActivityType.PLANTING,
	})
	@IsOptional()
	@IsEnum(ActivityType)
	activityType?: ActivityType;

	@ApiPropertyOptional({
		example: '2025-02-05',
		description: 'Date the activity was completed',
	})
	@IsOptional()
	@IsDateString()
	activityDate?: string;

	@ApiPropertyOptional({
		example: 'Applied organic fertilizer on row 1',
	})
	@IsOptional()
	@IsString()
	@MaxLength(500)
	notes?: string | null;

	@ApiPropertyOptional({
		example: 'NPK 20-10-10',
		description: 'Optional input product reference',
	})
	@IsOptional()
	@IsString()
	@MaxLength(255)
	inputProduct?: string | null;

	@ApiPropertyOptional({
		example: 12500,
		description: 'Optional input cost associated with the activity (XAF)',
	})
	@IsOptional()
	@IsNumber()
	@Min(0)
	inputCostXaf?: number | null;

	@ApiPropertyOptional({
		example: 'ec0e2adc-8f6d-42b9-90e8-a50cf50f1265',
		description: 'Optional planting season to associate with this activity',
	})
	@IsOptional()
	@IsUUID()
	plantingSeasonId?: string | null;
}
