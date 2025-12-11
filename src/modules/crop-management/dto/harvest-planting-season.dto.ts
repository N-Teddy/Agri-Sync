import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, Min } from 'class-validator';

export class HarvestPlantingSeasonDto {
  @ApiProperty({
    example: '2025-09-15',
    description: 'Actual date when harvesting was completed',
  })
  @IsDateString()
  actualHarvestDate!: string;

  @ApiProperty({
    example: 1500,
    description: 'Harvest yield in kilograms',
  })
  @IsNumber()
  @Min(0)
  yieldKg!: number;
}
