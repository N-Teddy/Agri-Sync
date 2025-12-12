import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsDateString,
	IsNumber,
	IsOptional,
	IsString,
	MaxLength,
	Min,
} from 'class-validator';

export class RecordCostDto {
	@ApiProperty({
		example: 45000,
		description: 'Cost amount in XAF',
	})
	@IsNumber()
	@Min(0)
	amountXaf!: number;

	@ApiProperty({
		example: '2025-02-12',
		description: 'Date the cost was incurred (YYYY-MM-DD)',
	})
	@IsDateString()
	recordDate!: string;

	@ApiPropertyOptional({
		example: 'NPK 20-10-10',
		description: 'Optional product or input reference',
	})
	@IsOptional()
	@IsString()
	@MaxLength(255)
	productName?: string;

	@ApiPropertyOptional({
		example: 'Applied on Field Block A rows 1-3',
		description: 'Additional notes about the expense',
	})
	@IsOptional()
	@IsString()
	@MaxLength(500)
	description?: string;
}
