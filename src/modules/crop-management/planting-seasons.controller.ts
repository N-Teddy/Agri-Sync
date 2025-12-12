import {
	Body,
	Controller,
	Get,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import {
	CurrentUser,
	RequestUser,
} from '../../common/decorators/current-user.decorator';
import { CreatePlantingSeasonDto } from './dto/create-planting-season.dto';
import { HarvestPlantingSeasonDto } from './dto/harvest-planting-season.dto';
import { PlantingSeasonsService } from './planting-seasons.service';

@ApiBearerAuth()
@ApiTags('Crop Management')
@Controller({
	path: 'fields/:fieldId/planting-seasons',
	version: '1',
})
export class PlantingSeasonsController {
	constructor(
		private readonly plantingSeasonsService: PlantingSeasonsService
	) {}

	@Post()
	createSeason(
		@CurrentUser() user: RequestUser,
		@Param('fieldId', ParseUUIDPipe) fieldId: string,
		@Body() dto: CreatePlantingSeasonDto
	) {
		return this.plantingSeasonsService.createSeason(user.sub, fieldId, dto);
	}

	@Get()
	findAll(
		@CurrentUser() user: RequestUser,
		@Param('fieldId', ParseUUIDPipe) fieldId: string
	) {
		return this.plantingSeasonsService.getSeasonsForField(
			user.sub,
			fieldId
		);
	}

	@Get(':seasonId')
	findOne(
		@CurrentUser() user: RequestUser,
		@Param('fieldId', ParseUUIDPipe) fieldId: string,
		@Param('seasonId', ParseUUIDPipe) seasonId: string
	) {
		return this.plantingSeasonsService.getSeason(
			user.sub,
			fieldId,
			seasonId
		);
	}

	@Patch(':seasonId/harvest')
	markHarvest(
		@CurrentUser() user: RequestUser,
		@Param('fieldId', ParseUUIDPipe) fieldId: string,
		@Param('seasonId', ParseUUIDPipe) seasonId: string,
		@Body() dto: HarvestPlantingSeasonDto
	) {
		return this.plantingSeasonsService.markHarvestComplete(
			user.sub,
			fieldId,
			seasonId,
			dto
		);
	}
}
