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

import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';

import { CreateFieldActivityDto } from './dto/create-field-activity.dto';
import { FieldActivitiesFilterDto } from './dto/field-activities-filter.dto';
import { FieldActivitiesService } from './field-activities.service';

@ApiBearerAuth()
@ApiTags('Crop Management')
@Controller({
  path: 'fields/:fieldId/activities',
  version: '1',
})
export class FieldActivitiesController {
  constructor(
    private readonly fieldActivitiesService: FieldActivitiesService,
  ) { }

  @Post()
  logActivity(
    @CurrentUser() user: RequestUser,
    @Param('fieldId', ParseUUIDPipe) fieldId: string,
    @Body() dto: CreateFieldActivityDto,
  ) {
    return this.fieldActivitiesService.logActivity(user.sub, fieldId, dto);
  }

  @Get()
  getActivities(
    @CurrentUser() user: RequestUser,
    @Param('fieldId', ParseUUIDPipe) fieldId: string,
    @Query() filters: FieldActivitiesFilterDto,
  ) {
    return this.fieldActivitiesService.getActivities(user.sub, fieldId, filters);
  }
}
