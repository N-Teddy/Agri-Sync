import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Field } from '../../entities/field.entity';

import { CreateFieldDto } from './dto/create-field.dto';
import { PlantationsService } from './plantations.service';
import { calculateFieldAreaHectares } from './utils/field-geometry.util';

const MAX_FIELDS_PER_PLANTATION = 5;

@Injectable()
export class PlantationFieldsService {
  constructor(
    @InjectRepository(Field)
    private readonly fieldsRepository: Repository<Field>,
    private readonly plantationsService: PlantationsService,
  ) { }

  async createField(
    ownerId: string,
    plantationId: string,
    dto: CreateFieldDto,
  ) {
    const plantation = await this.plantationsService.getOwnedPlantation(
      ownerId,
      plantationId,
    );

    await this.ensureFieldLimitNotReached(plantation.id);

    const areaHectares = calculateFieldAreaHectares(dto.boundary);

    const field = this.fieldsRepository.create({
      plantation,
      name: dto.name,
      soilType: dto.soilType,
      boundary: dto.boundary as unknown as Record<string, unknown>,
      areaHectares: areaHectares.toFixed(2),
    });

    return this.fieldsRepository.save(field);
  }

  async getFieldsForPlantation(ownerId: string, plantationId: string) {
    await this.plantationsService.getOwnedPlantation(ownerId, plantationId);
    return this.fieldsRepository.find({
      where: { plantation: { id: plantationId } },
      order: { createdAt: 'DESC' },
    });
  }

  async getField(ownerId: string, plantationId: string, fieldId: string) {
    await this.plantationsService.getOwnedPlantation(ownerId, plantationId);
    const field = await this.fieldsRepository.findOne({
      where: { id: fieldId, plantation: { id: plantationId } },
    });

    if (!field) {
      throw new NotFoundException('Field not found in this plantation');
    }

    return field;
  }

  private async ensureFieldLimitNotReached(plantationId: string) {
    const count = await this.fieldsRepository.count({
      where: { plantation: { id: plantationId } },
    });

    if (count >= MAX_FIELDS_PER_PLANTATION) {
      throw new BadRequestException(
        `A maximum of ${MAX_FIELDS_PER_PLANTATION} fields is allowed per plantation`,
      );
    }
  }
}
