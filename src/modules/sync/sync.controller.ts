import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import {
	CurrentUser,
	RequestUser,
} from '../../common/decorators/current-user.decorator';
import { SyncPullQueryDto, SyncPushDto } from './dto/sync.dto';
import { SyncPullResult, SyncPushResult, SyncService } from './sync.service';

@ApiBearerAuth()
@ApiTags('Sync')
@Controller({
	path: 'sync',
	version: '1',
})
export class SyncController {
	constructor(private readonly syncService: SyncService) {}

	@Post('push')
	pushChanges(
		@CurrentUser() user: RequestUser,
		@Body() dto: SyncPushDto
	): Promise<SyncPushResult> {
		return this.syncService.push(user.sub, dto.operations);
	}

	@Get('pull')
	pullChanges(
		@CurrentUser() user: RequestUser,
		@Query() query: SyncPullQueryDto
	): Promise<SyncPullResult> {
		return this.syncService.pull(user.sub, query.since);
	}
}
