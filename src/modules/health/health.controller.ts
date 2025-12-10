import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { buildSuccessResponse } from '../common/utils/api-response.util';

import { HealthService } from './health.service';

@Controller({
  path: 'health',
  version: '1',
})
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  async check() {
    const status = await this.healthService.check();
    return buildSuccessResponse('Application healthy', status);
  }
}
