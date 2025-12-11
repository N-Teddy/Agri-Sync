import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PlantingSeasonStatus } from '../../common/enums/planting-season-status.enum';
import { FieldActivity } from '../../entities/field-activity.entity';
import { PlantingSeason } from '../../entities/planting-season.entity';

import { CreateFieldActivityDto } from './dto/create-field-activity.dto';
import { FieldActivitiesFilterDto } from './dto/field-activities-filter.dto';
import { FieldAccessService } from '../fields/field-access.service';
import { normalizeDateInput } from './utils/date.util';

@Injectable()
export class FieldActivitiesService {
  constructor(
    @InjectRepository(FieldActivity)
    private readonly fieldActivitiesRepository: Repository<FieldActivity>,
    @InjectRepository(PlantingSeason)
    private readonly plantingSeasonsRepository: Repository<PlantingSeason>,
    private readonly fieldAccessService: FieldAccessService,
  ) { }

  async logActivity(
    ownerId: string,
    fieldId: string,
    dto: CreateFieldActivityDto,
  ): Promise<FieldActivity> {
    const field = await this.fieldAccessService.getOwnedField(fieldId, ownerId);
    const plantingSeason = dto.plantingSeasonId
      ? await this.findSeasonForField(field.id, dto.plantingSeasonId)
      : await this.findActiveSeason(field.id);

    const activityDate = normalizeDateInput(dto.activityDate);

    const activity = this.fieldActivitiesRepository.create({
      field,
      plantingSeason: plantingSeason ?? undefined,
      activityType: dto.activityType,
      activityDate,
      notes: dto.notes,
      inputProduct: dto.inputProduct,
      inputCostXaf:
        typeof dto.inputCostXaf === 'number'
          ? dto.inputCostXaf.toFixed(2)
          : undefined,
    });

    return this.fieldActivitiesRepository.save(activity);
  }

  async getActivities(
    ownerId: string,
    fieldId: string,
    filters: FieldActivitiesFilterDto,
  ): Promise<FieldActivity[]> {
    await this.fieldAccessService.getOwnedField(fieldId, ownerId);

    const query = this.fieldActivitiesRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.plantingSeason', 'plantingSeason')
      .where('activity.fieldId = :fieldId', { fieldId })
      .orderBy('activity.activityDate', 'DESC')
      .addOrderBy('activity.createdAt', 'DESC');

    if (filters.plantingSeasonId) {
      query.andWhere('activity.plantingSeasonId = :seasonId', {
        seasonId: filters.plantingSeasonId,
      });
    }

    return query.getMany();
  }

  private async findSeasonForField(fieldId: string, seasonId: string) {
    const season = await this.plantingSeasonsRepository.findOne({
      where: {
        id: seasonId,
        field: { id: fieldId },
      },
    });

    if (!season) {
      throw new BadRequestException(
        'Planting season not found for this field',
      );
    }

    return season;
  }

  private async findActiveSeason(fieldId: string) {
    return this.plantingSeasonsRepository.findOne({
      where: {
        field: { id: fieldId },
        status: PlantingSeasonStatus.ACTIVE,
      },
    });
  }
}
