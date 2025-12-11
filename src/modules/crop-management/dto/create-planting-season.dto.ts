import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

import { CropType } from '../../../common/enums/crop-type.enum';

export class CreatePlantingSeasonDto {
  @ApiProperty({
    enum: CropType,
    example: CropType.COFFEE_ROBUSTA,
    description: 'Crop to be grown in the field',
  })
  @IsEnum(CropType)
  cropType!: CropType;

  @ApiProperty({
    example: '2025-02-01',
    description: 'Planting date for the crop (YYYY-MM-DD)',
  })
  @IsDateString()
  plantingDate!: string;

  @ApiPropertyOptional({
    example: '2025-08-01',
    description: 'Optional expected harvest date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  expectedHarvestDate?: string;
}
