import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import {
	CurrentUser,
	RequestUser,
} from '../../common/decorators/current-user.decorator';
import { CreateFieldActivityDto } from './dto/create-field-activity.dto';
import { FieldActivitiesFilterDto } from './dto/field-activities-filter.dto';
import { UpdateFieldActivityDto } from './dto/update-field-activity.dto';
import { FieldActivitiesService } from './field-activities.service';

@ApiBearerAuth()
@ApiTags('Crop Management')
@Controller({
	path: 'fields/:fieldId/activities',
	version: '1',
})
export class FieldActivitiesController {
	constructor(
		private readonly fieldActivitiesService: FieldActivitiesService
	) {}

	@Post()
	logActivity(
		@CurrentUser() user: RequestUser,
		@Param('fieldId', ParseUUIDPipe) fieldId: string,
		@Body() dto: CreateFieldActivityDto
	) {
		return this.fieldActivitiesService.logActivity(user.sub, fieldId, dto);
	}

	@Get()
	getActivities(
		@CurrentUser() user: RequestUser,
		@Param('fieldId', ParseUUIDPipe) fieldId: string,
		@Query() filters: FieldActivitiesFilterDto
	) {
		return this.fieldActivitiesService.getActivities(
			user.sub,
			fieldId,
			filters
		);
	}

	@Get(':activityId')
	getActivity(
		@CurrentUser() user: RequestUser,
		@Param('fieldId', ParseUUIDPipe) fieldId: string,
		@Param('activityId', ParseUUIDPipe) activityId: string
	) {
		return this.fieldActivitiesService.getActivity(
			user.sub,
			fieldId,
			activityId
		);
	}

	@Patch(':activityId')
	updateActivity(
		@CurrentUser() user: RequestUser,
		@Param('fieldId', ParseUUIDPipe) fieldId: string,
		@Param('activityId', ParseUUIDPipe) activityId: string,
		@Body() dto: UpdateFieldActivityDto
	) {
		return this.fieldActivitiesService.updateActivity(
			user.sub,
			fieldId,
			activityId,
			dto
		);
	}

	@Delete(':activityId')
	deleteActivity(
		@CurrentUser() user: RequestUser,
		@Param('fieldId', ParseUUIDPipe) fieldId: string,
		@Param('activityId', ParseUUIDPipe) activityId: string
	) {
		return this.fieldActivitiesService.deleteActivity(
			user.sub,
			fieldId,
			activityId
		);
	}
}
