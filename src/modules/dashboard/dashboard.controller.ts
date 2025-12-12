import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';

import { DashboardService } from './dashboard.service';

@ApiBearerAuth()
@ApiTags('Dashboard')
@Controller({
  path: 'dashboard',
  version: '1',
})
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get('summary')
  getSummary(@CurrentUser() user: RequestUser) {
    return this.dashboardService.getSummary(user.sub);
  }
}
