import {
    Controller,
    Get,
    Header,
    Query,
    Res,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import {
    CurrentUser,
    RequestUser,
} from '../../common/decorators/current-user.decorator';
import { ExportService } from './export.service';

@ApiBearerAuth()
@ApiTags('Data Export')
@Controller({
    path: 'export',
    version: '1',
})
export class ExportController {
    constructor(private readonly exportService: ExportService) { }

    @Get('financial-records')
    @Header('Content-Type', 'text/csv')
    @ApiOperation({ summary: 'Export financial records to CSV' })
    @ApiQuery({
        name: 'fieldId',
        required: false,
        description: 'Optional field ID to filter records',
    })
    async exportFinancialRecords(
        @CurrentUser() user: RequestUser,
        @Query('fieldId', new ParseUUIDPipe({ optional: true }))
        fieldId: string | undefined,
        @Res() res: Response
    ): Promise<void> {
        const csv = await this.exportService.exportFinancialRecords(
            user.sub,
            fieldId
        );

        const filename = fieldId
            ? `financial-records-${fieldId}-${Date.now()}.csv`
            : `financial-records-all-${Date.now()}.csv`;

        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csv);
    }

    @Get('activities')
    @Header('Content-Type', 'text/csv')
    @ApiOperation({ summary: 'Export field activities to CSV' })
    @ApiQuery({
        name: 'fieldId',
        required: false,
        description: 'Optional field ID to filter activities',
    })
    async exportActivities(
        @CurrentUser() user: RequestUser,
        @Query('fieldId', new ParseUUIDPipe({ optional: true }))
        fieldId: string | undefined,
        @Res() res: Response
    ): Promise<void> {
        const csv = await this.exportService.exportActivities(user.sub, fieldId);

        const filename = fieldId
            ? `activities-${fieldId}-${Date.now()}.csv`
            : `activities-all-${Date.now()}.csv`;

        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csv);
    }

    @Get('fields')
    @Header('Content-Type', 'text/csv')
    @ApiOperation({ summary: 'Export fields to CSV' })
    async exportFields(
        @CurrentUser() user: RequestUser,
        @Res() res: Response
    ): Promise<void> {
        const csv = await this.exportService.exportFields(user.sub);

        const filename = `fields-${Date.now()}.csv`;

        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csv);
    }

    @Get('planting-seasons')
    @Header('Content-Type', 'text/csv')
    @ApiOperation({ summary: 'Export planting seasons to CSV' })
    @ApiQuery({
        name: 'fieldId',
        required: false,
        description: 'Optional field ID to filter seasons',
    })
    async exportPlantingSeasons(
        @CurrentUser() user: RequestUser,
        @Query('fieldId', new ParseUUIDPipe({ optional: true }))
        fieldId: string | undefined,
        @Res() res: Response
    ): Promise<void> {
        const csv = await this.exportService.exportPlantingSeasons(
            user.sub,
            fieldId
        );

        const filename = fieldId
            ? `planting-seasons-${fieldId}-${Date.now()}.csv`
            : `planting-seasons-all-${Date.now()}.csv`;

        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csv);
    }
}
