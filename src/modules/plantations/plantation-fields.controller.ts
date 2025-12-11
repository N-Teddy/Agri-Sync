import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';

import { CreateFieldDto } from './dto/create-field.dto';
import { PlantationFieldsService } from './plantation-fields.service';

@ApiBearerAuth()
@ApiTags('Plantations')
@Controller({
  path: 'plantations/:plantationId/fields',
  version: '1',
})
export class PlantationFieldsController {
  constructor(
    private readonly plantationFieldsService: PlantationFieldsService,
  ) { }

  @Post()
  createField(
    @CurrentUser() user: RequestUser,
    @Param('plantationId', ParseUUIDPipe) plantationId: string,
    @Body() dto: CreateFieldDto,
  ) {
    return this.plantationFieldsService.createField(user.sub, plantationId, dto);
  }

  @Get()
  listFields(
    @CurrentUser() user: RequestUser,
    @Param('plantationId', ParseUUIDPipe) plantationId: string,
  ) {
    return this.plantationFieldsService.getFieldsForPlantation(
      user.sub,
      plantationId,
    );
  }

  @Get(':fieldId')
  getField(
    @CurrentUser() user: RequestUser,
    @Param('plantationId', ParseUUIDPipe) plantationId: string,
    @Param('fieldId', ParseUUIDPipe) fieldId: string,
  ) {
    return this.plantationFieldsService.getField(
      user.sub,
      plantationId,
      fieldId,
    );
  }
}
