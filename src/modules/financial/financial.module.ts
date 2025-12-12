import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FinancialRecord } from '../../entities/financial-record.entity';
import { FieldsModule } from '../fields/fields.module';
import { FinancialRecordsController } from './financial-records.controller';
import { FinancialRecordsService } from './financial-records.service';

@Module({
	imports: [TypeOrmModule.forFeature([FinancialRecord]), FieldsModule],
	controllers: [FinancialRecordsController],
	providers: [FinancialRecordsService],
	exports: [FinancialRecordsService],
})
export class FinancialModule {}
