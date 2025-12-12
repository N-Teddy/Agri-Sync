import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class FieldActivitiesFilterDto {
	@ApiPropertyOptional({
		example: 'ec0e2adc-8f6d-42b9-90e8-a50cf50f1265',
		description: 'Filter to a specific planting season',
	})
	@IsOptional()
	@IsUUID()
	plantingSeasonId?: string;
}
