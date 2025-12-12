import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { PlantingSeasonStatus } from '../../common/enums/planting-season-status.enum';
import { Field } from '../../entities/field.entity';
import { PlantingSeason } from '../../entities/planting-season.entity';

import { normalizeDateInput } from '../../common/utils/date.util';
import { FieldAccessService } from '../fields/field-access.service';
import { CreatePlantingSeasonDto } from './dto/create-planting-season.dto';
import { HarvestPlantingSeasonDto } from './dto/harvest-planting-season.dto';
import { calculateGrowthStage } from './utils/growth-stage.util';

@Injectable()
export class PlantingSeasonsService {
  constructor(
    @InjectRepository(PlantingSeason)
    private readonly plantingSeasonsRepository: Repository<PlantingSeason>,
    @InjectRepository(Field)
    private readonly fieldsRepository: Repository<Field>,
    private readonly fieldAccessService: FieldAccessService,
  ) { }

  async createSeason(
    ownerId: string,
    fieldId: string,
    dto: CreatePlantingSeasonDto,
  ): Promise<PlantingSeason> {
    const field = await this.fieldAccessService.getOwnedField(fieldId, ownerId);
    await this.ensureNoActiveSeason(field.id);

    const plantingDate = normalizeDateInput(dto.plantingDate);
    const expectedHarvestDate = dto.expectedHarvestDate
      ? normalizeDateInput(dto.expectedHarvestDate)
      : undefined;

    const season = this.plantingSeasonsRepository.create({
      field,
      cropType: dto.cropType,
      plantingDate,
      expectedHarvestDate,
      status: PlantingSeasonStatus.ACTIVE,
    });

    season.growthStage = calculateGrowthStage({
      plantingDate,
      status: season.status,
    });

    const savedSeason = await this.plantingSeasonsRepository.save(season);
    field.currentCrop = dto.cropType;
    await this.fieldsRepository.save(field);

    return savedSeason;
  }

  async getSeasonsForField(
    ownerId: string,
    fieldId: string,
  ): Promise<PlantingSeason[]> {
    const field = await this.fieldAccessService.getOwnedField(fieldId, ownerId);

    const seasons = await this.plantingSeasonsRepository.find({
      where: { field: { id: field.id } },
      order: { plantingDate: 'DESC' },
    });

    return seasons.map((season) => this.withDerivedGrowthStage(season));
  }

  async getSeason(
    ownerId: string,
    fieldId: string,
    seasonId: string,
  ): Promise<PlantingSeason> {
    await this.fieldAccessService.getOwnedField(fieldId, ownerId);
    const season = await this.findSeasonForField(fieldId, seasonId);
    return this.withDerivedGrowthStage(season);
  }

  async markHarvestComplete(
    ownerId: string,
    fieldId: string,
    seasonId: string,
    dto: HarvestPlantingSeasonDto,
  ): Promise<PlantingSeason> {
    const field = await this.fieldAccessService.getOwnedField(fieldId, ownerId);
    const season = await this.findSeasonForField(field.id, seasonId);

    if (season.status === PlantingSeasonStatus.HARVESTED) {
      throw new BadRequestException('This season has already been harvested');
    }

    const actualHarvestDate = normalizeDateInput(dto.actualHarvestDate);
    season.actualHarvestDate = actualHarvestDate;
    season.yieldKg = dto.yieldKg.toString();
    season.status = PlantingSeasonStatus.HARVESTED;
    season.growthStage = calculateGrowthStage({
      plantingDate: season.plantingDate,
      actualHarvestDate,
      status: season.status,
    });

    const savedSeason = await this.plantingSeasonsRepository.save(season);
    field.currentCrop = null;
    await this.fieldsRepository.save(field);

    return savedSeason;
  }

  private async ensureNoActiveSeason(fieldId: string) {
    const existingSeason = await this.plantingSeasonsRepository.findOne({
      where: {
        field: { id: fieldId },
        status: In([
          PlantingSeasonStatus.ACTIVE,
          PlantingSeasonStatus.PLANNED,
        ]),
      },
    });

    if (existingSeason) {
      throw new BadRequestException(
        'Field already has an active or planned season',
      );
    }
  }

  private async findSeasonForField(fieldId: string, seasonId: string) {
    const season = await this.plantingSeasonsRepository.findOne({
      where: { id: seasonId, field: { id: fieldId } },
    });

    if (!season) {
      throw new NotFoundException('Planting season not found');
    }

    return season;
  }

  private withDerivedGrowthStage(season: PlantingSeason): PlantingSeason {
    season.growthStage = calculateGrowthStage({
      plantingDate: season.plantingDate,
      actualHarvestDate: season.actualHarvestDate ?? undefined,
      status: season.status,
    });
    return season;
  }
}
