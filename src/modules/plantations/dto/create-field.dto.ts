import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MaxLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

import { FieldBoundary } from '../types/field-boundary.type';

@ValidatorConstraint({ name: 'GeoJsonPolygon', async: false })
class GeoJsonPolygonConstraint implements ValidatorConstraintInterface {
  validate(value: FieldBoundary) {
    if (!value || value.type !== 'Polygon' || !Array.isArray(value.coordinates)) {
      return false;
    }

    const [outerRing] = value.coordinates;
    if (!Array.isArray(outerRing) || outerRing.length < 4) {
      return false;
    }

    for (const coord of outerRing) {
      if (
        !Array.isArray(coord) ||
        coord.length !== 2 ||
        coord.some((point) => typeof point !== 'number')
      ) {
        return false;
      }
      const [lng, lat] = coord;
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return false;
      }
    }

    const [firstLon, firstLat] = outerRing[0];
    const [lastLon, lastLat] = outerRing[outerRing.length - 1];
    return firstLon === lastLon && firstLat === lastLat;
  }

  defaultMessage(_args?: ValidationArguments) {
    void _args;
    return 'Boundary must be a valid GeoJSON Polygon with closed coordinates';
  }
}

export class CreateFieldDto {
  @ApiProperty({ example: 'Block A - North' })
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({ example: 'Loamy' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  soilType?: string;

  @ApiProperty({
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
  @Validate(GeoJsonPolygonConstraint)
  boundary!: FieldBoundary;
}
