import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePlantationDto {
	@ApiPropertyOptional({ example: 'Mount Fako Estate' })
	@IsOptional()
	@IsString()
	@MaxLength(255)
	name?: string;

	@ApiPropertyOptional({ example: 'Buea' })
	@IsOptional()
	@IsString()
	@MaxLength(255)
	location?: string;

	@ApiPropertyOptional({ example: 'South-West' })
	@IsOptional()
	@IsString()
	@MaxLength(100)
	region?: string;

	@ApiPropertyOptional({ example: false })
	@IsOptional()
	@IsBoolean()
	isArchived?: boolean;
}
