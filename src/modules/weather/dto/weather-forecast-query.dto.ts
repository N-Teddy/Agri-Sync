import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class WeatherForecastQueryDto {
  @ApiPropertyOptional({
    example: 3,
    minimum: 1,
    maximum: 7,
    description: 'Number of forecast days to retrieve (1-7)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  days?: number;
}
