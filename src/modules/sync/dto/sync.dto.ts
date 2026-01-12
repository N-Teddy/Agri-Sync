import { ApiProperty } from '@nestjs/swagger';
import {
	IsArray,
	IsDateString,
	IsEnum,
	IsObject,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum SyncEntity {
	PLANTATION = 'plantation',
	FIELD = 'field',
	PLANTING_SEASON = 'plantingSeason',
	ACTIVITY = 'activity',
	FINANCIAL_RECORD = 'financialRecord',
	ACTIVITY_PHOTO = 'activityPhoto',
}

export enum SyncOperation {
	CREATE = 'create',
	UPDATE = 'update',
	DELETE = 'delete',
}

export class SyncOperationDto {
	@ApiProperty({
		required: false,
		description: 'Client operation ID for tracking',
	})
	@IsOptional()
	@IsString()
	operationId?: string;

	@ApiProperty({ enum: SyncEntity })
	@IsEnum(SyncEntity)
	entity!: SyncEntity;

	@ApiProperty({ enum: SyncOperation })
	@IsEnum(SyncOperation)
	operation!: SyncOperation;

	@ApiProperty({ description: 'Client payload for the operation' })
	@IsObject()
	payload!: Record<string, unknown>;

	@ApiProperty({
		description: 'Client timestamp for last update (ISO 8601)',
		example: '2025-01-01T12:00:00.000Z',
	})
	@IsDateString()
	clientUpdatedAt!: string;
}

export class SyncPushDto {
	@ApiProperty({ type: [SyncOperationDto] })
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => SyncOperationDto)
	operations!: SyncOperationDto[];
}

export class SyncPullQueryDto {
	@ApiProperty({
		required: false,
		description: 'ISO date string for incremental sync',
		example: '2025-01-01T00:00:00.000Z',
	})
	@IsOptional()
	@IsDateString()
	since?: string;
}
