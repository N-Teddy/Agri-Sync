import {
	Body,
	Controller,
	Delete,
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
import { CreatePlantationDto } from './dto/create-plantation.dto';
import { UpdatePlantationDto } from './dto/update-plantation.dto';
import { PlantationsService } from './plantations.service';

@ApiBearerAuth()
@ApiTags('Plantations')
@Controller({
	path: 'plantations',
	version: '1',
})
export class PlantationsController {
	constructor(private readonly plantationsService: PlantationsService) {}

	@Post()
	create(@CurrentUser() user: RequestUser, @Body() dto: CreatePlantationDto) {
		return this.plantationsService.create(user.sub, dto);
	}

	@Get()
	findAll(@CurrentUser() user: RequestUser) {
		return this.plantationsService.findAll(user.sub);
	}

	@Get(':plantationId')
	findOne(
		@CurrentUser() user: RequestUser,
		@Param('plantationId', ParseUUIDPipe) plantationId: string
	) {
		return this.plantationsService.findOne(user.sub, plantationId);
	}

	@Patch(':plantationId')
	update(
		@CurrentUser() user: RequestUser,
		@Param('plantationId', ParseUUIDPipe) plantationId: string,
		@Body() dto: UpdatePlantationDto
	) {
		return this.plantationsService.update(user.sub, plantationId, dto);
	}

	@Delete(':plantationId')
	remove(
		@CurrentUser() user: RequestUser,
		@Param('plantationId', ParseUUIDPipe) plantationId: string
	) {
		return this.plantationsService.remove(user.sub, plantationId);
	}
}
