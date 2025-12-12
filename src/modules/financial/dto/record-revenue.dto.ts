import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsDateString,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
	MaxLength,
	Min,
} from 'class-validator';

import { CropType } from '../../../common/enums/crop-type.enum';

export class RecordRevenueDto {
	@ApiProperty({
		enum: CropType,
		example: CropType.COFFEE_ARABICA,
		description: 'Crop associated with the sale',
	})
	@IsEnum(CropType)
	cropType!: CropType;

	@ApiProperty({
		example: 1500,
		description: 'Harvest quantity sold (kg)',
	})
	@IsNumber()
	@Min(0)
	quantityKg!: number;

	@ApiProperty({
		example: 2500,
		description: 'Price per kilogram in XAF',
	})
	@IsNumber()
	@Min(0)
	pricePerKgXaf!: number;

	@ApiProperty({
		example: '2025-09-01',
		description: 'Date of the sale (YYYY-MM-DD)',
	})
	@IsDateString()
	recordDate!: string;

	@ApiPropertyOptional({
		example: 'Sold to Douala Coffee Traders',
		description: 'Optional sale description',
	})
	@IsOptional()
	@IsString()
	@MaxLength(500)
	description?: string;

	@ApiPropertyOptional({
		example: 'Douala Coffee Traders',
		description: 'Optional buyer reference',
	})
	@IsOptional()
	@IsString()
	@MaxLength(255)
	buyerName?: string;
}
