import { ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsBoolean,
	IsOptional,
	IsString,
	MaxLength,
	Validate,
} from 'class-validator';

import { FieldBoundary } from '../types/field-boundary.type';
import { GeoJsonPolygonConstraint } from './geojson-polygon.validator';

export class UpdateFieldDto {
	@ApiPropertyOptional({ example: 'Block A - North' })
	@IsOptional()
	@IsString()
	@MaxLength(255)
	name?: string;

	@ApiPropertyOptional({ example: 'Loamy' })
	@IsOptional()
	@IsString()
	@MaxLength(100)
	soilType?: string | null;

	@ApiPropertyOptional({
		description: 'GeoJSON Polygon describing the field boundary',
		example: {
			type: 'Polygon',
			coordinates: [
				[
					[9.312744, 4.152969],
					[9.314117, 4.152969],
					[9.314117, 4.154026],
					[9.312744, 4.154026],
					[9.312744, 4.152969],
				],
			],
		},
	})
	@IsOptional()
	@Validate(GeoJsonPolygonConstraint)
	boundary?: FieldBoundary;

	@ApiPropertyOptional({ example: false })
	@IsOptional()
	@IsBoolean()
	isArchived?: boolean;
}
