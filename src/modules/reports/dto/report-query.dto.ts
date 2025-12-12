import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class DateRangeDto {
    @ApiProperty({
        description: 'Start date (ISO 8601 format)',
        example: '2024-01-01',
    })
    @IsDateString()
    startDate!: string;

    @ApiProperty({
        description: 'End date (ISO 8601 format)',
        example: '2024-12-31',
    })
    @IsDateString()
    endDate!: string;
}

export class FieldReportQueryDto extends DateRangeDto {
    @ApiProperty({
        description: 'Field ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    fieldId!: string;
}

export class SeasonReportQueryDto {
    @ApiProperty({
        description: 'Season ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    seasonId!: string;
}
