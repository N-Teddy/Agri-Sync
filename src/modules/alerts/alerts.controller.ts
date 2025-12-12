import {
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import {
    CurrentUser,
    RequestUser,
} from '../../common/decorators/current-user.decorator';
import { Alert } from '../../entities/alert.entity';
import { AlertsService } from './alerts.service';
import { GetAlertsQueryDto } from './dto/get-alerts-query.dto';

@ApiBearerAuth()
@ApiTags('Alerts')
@Controller({
    path: 'alerts',
    version: '1',
})
export class AlertsController {
    constructor(private readonly alertsService: AlertsService) { }

    @Get()
    @ApiOperation({ summary: 'Get all alerts for the authenticated user' })
    getAlerts(
        @CurrentUser() user: RequestUser,
        @Query() query: GetAlertsQueryDto
    ): Promise<Alert[]> {
        return this.alertsService.getAlerts(user.sub, query);
    }

    @Get('unacknowledged-count')
    @ApiOperation({ summary: 'Get count of unacknowledged alerts' })
    getUnacknowledgedCount(
        @CurrentUser() user: RequestUser
    ): Promise<{ count: number }> {
        return this.alertsService
            .getUnacknowledgedCount(user.sub)
            .then((count) => ({ count }));
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific alert by ID' })
    getAlertById(
        @CurrentUser() user: RequestUser,
        @Param('id', ParseUUIDPipe) id: string
    ): Promise<Alert> {
        return this.alertsService.getAlertById(user.sub, id);
    }

    @Patch(':id/acknowledge')
    @ApiOperation({ summary: 'Mark an alert as acknowledged' })
    acknowledgeAlert(
        @CurrentUser() user: RequestUser,
        @Param('id', ParseUUIDPipe) id: string
    ): Promise<Alert> {
        return this.alertsService.acknowledgeAlert(user.sub, id);
    }

    @Patch(':id/resolve')
    @ApiOperation({ summary: 'Mark an alert as resolved' })
    resolveAlert(
        @CurrentUser() user: RequestUser,
        @Param('id', ParseUUIDPipe) id: string
    ): Promise<Alert> {
        return this.alertsService.resolveAlert(user.sub, id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an alert' })
    deleteAlert(
        @CurrentUser() user: RequestUser,
        @Param('id', ParseUUIDPipe) id: string
    ): Promise<void> {
        return this.alertsService.deleteAlert(user.sub, id);
    }
}
