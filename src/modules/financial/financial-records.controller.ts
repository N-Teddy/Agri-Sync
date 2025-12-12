import {
	Body,
	Controller,
	Get,
	Param,
	ParseUUIDPipe,
	Post,
	Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import {
	CurrentUser,
	RequestUser,
} from '../../common/decorators/current-user.decorator';
import { FinancialRecordsFilterDto } from './dto/financial-records-filter.dto';
import { RecordCostDto } from './dto/record-cost.dto';
import { RecordRevenueDto } from './dto/record-revenue.dto';
import { FinancialRecordsService } from './financial-records.service';

@ApiBearerAuth()
@ApiTags('Financial')
@Controller({
	path: 'fields/:fieldId/financial-records',
	version: '1',
})
export class FinancialRecordsController {
	constructor(
		private readonly financialRecordsService: FinancialRecordsService
	) {}

	@Post('costs')
	recordCost(
		@CurrentUser() user: RequestUser,
		@Param('fieldId', ParseUUIDPipe) fieldId: string,
		@Body() dto: RecordCostDto
	) {
		return this.financialRecordsService.recordCost(user.sub, fieldId, dto);
	}

	@Post('revenue')
	recordRevenue(
		@CurrentUser() user: RequestUser,
		@Param('fieldId', ParseUUIDPipe) fieldId: string,
		@Body() dto: RecordRevenueDto
	) {
		return this.financialRecordsService.recordRevenue(
			user.sub,
			fieldId,
			dto
		);
	}

	@Get()
	getRecords(
		@CurrentUser() user: RequestUser,
		@Param('fieldId', ParseUUIDPipe) fieldId: string,
		@Query() filters: FinancialRecordsFilterDto
	) {
		return this.financialRecordsService.getRecords(
			user.sub,
			fieldId,
			filters
		);
	}

	@Get('summary')
	getFieldSummary(
		@CurrentUser() user: RequestUser,
		@Param('fieldId', ParseUUIDPipe) fieldId: string
	) {
		return this.financialRecordsService.getFieldSummary(user.sub, fieldId);
	}
}
