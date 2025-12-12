import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

import { FinancialRecordType } from '../../../common/enums/financial-record-type.enum';

export class FinancialRecordsFilterDto {
  @ApiPropertyOptional({
    enum: FinancialRecordType,
    description: 'Filter by record type (cost or revenue)',
  })
  @IsOptional()
  @IsEnum(FinancialRecordType)
  recordType?: FinancialRecordType;

  @ApiPropertyOptional({
    example: '2025-01-01',
    description: 'Filter records on or after this date',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2025-03-31',
    description: 'Filter records on or before this date',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
