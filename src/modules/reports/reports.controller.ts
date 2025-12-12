import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import {
    CurrentUser,
    RequestUser,
} from '../../common/decorators/current-user.decorator';
import {
    FieldReportQueryDto,
    SeasonReportQueryDto,
} from './dto/report-query.dto';
import {
    FieldPerformanceReport,
    SeasonalSummaryReport,
    WeatherImpactReport,
} from './interfaces/report.interfaces';
import { ReportsService } from './reports.service';

@ApiBearerAuth()
@ApiTags('Reports')
@Controller({
    path: 'reports',
    version: '1',
})
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('field-performance')
    @ApiOperation({ summary: 'Generate field performance report' })
    getFieldPerformance(
        @CurrentUser() user: RequestUser,
        @Query() query: FieldReportQueryDto
    ): Promise<FieldPerformanceReport> {
        return this.reportsService.generateFieldPerformanceReport(
            user.sub,
            query.fieldId
        );
    }

    @Get('seasonal-summary')
    @ApiOperation({ summary: 'Generate seasonal summary report' })
    getSeasonalSummary(
        @CurrentUser() user: RequestUser,
        @Query() query: SeasonReportQueryDto
    ): Promise<SeasonalSummaryReport> {
        return this.reportsService.generateSeasonalSummary(
            user.sub,
            query.seasonId
        );
    }

    @Get('weather-impact')
    @ApiOperation({ summary: 'Generate weather impact report' })
    getWeatherImpact(
        @CurrentUser() user: RequestUser,
        @Query() query: FieldReportQueryDto
    ): Promise<WeatherImpactReport> {
        return this.reportsService.generateWeatherImpactReport(
            user.sub,
            query.fieldId,
            query.startDate,
            query.endDate
        );
    }
}
