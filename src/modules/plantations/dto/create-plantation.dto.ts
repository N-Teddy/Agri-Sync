import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreatePlantationDto {
  @ApiProperty({ example: 'Mount Fako Estate' })
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ example: 'Buea' })
  @IsString()
  @MaxLength(255)
  location!: string;

  @ApiProperty({ example: 'South-West' })
  @IsString()
  @MaxLength(100)
  region!: string;
}
