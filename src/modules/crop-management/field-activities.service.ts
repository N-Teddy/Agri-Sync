import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ActivityType } from '../../common/enums/activity-type.enum';
import { CropType } from '../../common/enums/crop-type.enum';
import { PlantingSeasonStatus } from '../../common/enums/planting-season-status.enum';
import { normalizeDateInput } from '../../common/utils/date.util';
import { FieldActivity } from '../../entities/field-activity.entity';
import { PlantingSeason } from '../../entities/planting-season.entity';
import { FieldAccessService } from '../fields/field-access.service';
import { FinancialRecordsService } from '../financial/financial-records.service';
import { CreateFieldActivityDto } from './dto/create-field-activity.dto';
import { FieldActivitiesFilterDto } from './dto/field-activities-filter.dto';

const BASE_ACTIVITY_SEQUENCE: ActivityType[] = [
	ActivityType.LAND_PREPARATION,
	ActivityType.PLANTING,
	ActivityType.FERTILIZER_APPLICATION,
	ActivityType.SPRAYING,
	ActivityType.WEEDING,
	ActivityType.HARVESTING,
];

const CROP_ACTIVITY_RULES: Record<CropType, ActivityType[]> = {
	[CropType.COFFEE_ARABICA]: BASE_ACTIVITY_SEQUENCE,
	[CropType.COFFEE_ROBUSTA]: BASE_ACTIVITY_SEQUENCE,
	[CropType.COCOA]: BASE_ACTIVITY_SEQUENCE,
	[CropType.PLANTAIN]: BASE_ACTIVITY_SEQUENCE,
	[CropType.BANANA]: BASE_ACTIVITY_SEQUENCE,
	[CropType.MAIZE]: BASE_ACTIVITY_SEQUENCE,
};

@Injectable()
export class FieldActivitiesService {
	constructor(
		@InjectRepository(FieldActivity)
		private readonly fieldActivitiesRepository: Repository<FieldActivity>,
		@InjectRepository(PlantingSeason)
		private readonly plantingSeasonsRepository: Repository<PlantingSeason>,
		private readonly fieldAccessService: FieldAccessService,
		private readonly financialRecordsService: FinancialRecordsService
	) {}

	async logActivity(
		ownerId: string,
		fieldId: string,
		dto: CreateFieldActivityDto
	): Promise<FieldActivity> {
		const field = await this.fieldAccessService.getOwnedField(
			fieldId,
			ownerId
		);
		const plantingSeason = dto.plantingSeasonId
			? await this.findSeasonForField(field.id, dto.plantingSeasonId)
			: await this.findActiveSeason(field.id);

		const activityDate = normalizeDateInput(dto.activityDate);
		if (plantingSeason) {
			this.validateActivityForSeason(plantingSeason, activityDate);
			this.ensureActivityAllowedForCrop(plantingSeason, dto.activityType);
		}

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

		const savedActivity =
			await this.fieldActivitiesRepository.save(activity);

		if (typeof dto.inputCostXaf === 'number' && dto.inputCostXaf > 0) {
			await this.financialRecordsService.recordActivityCost(field, {
				amountXaf: dto.inputCostXaf,
				recordDate: activityDate,
				description: dto.notes,
				productName: dto.inputProduct,
			});
		}

		return savedActivity;
	}

	async getActivities(
		ownerId: string,
		fieldId: string,
		filters: FieldActivitiesFilterDto
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

	private validateActivityForSeason(
		season: PlantingSeason,
		activityDate: string
	) {
		if (season.status === PlantingSeasonStatus.HARVESTED) {
			throw new BadRequestException(
				'Cannot log activities for a harvested season'
			);
		}

		const activityTime = this.dateToEpoch(activityDate);
		const seasonStart = this.dateToEpoch(season.plantingDate);
		if (activityTime < seasonStart) {
			throw new BadRequestException(
				'Activity date cannot be before the planting date for this season'
			);
		}

		const seasonEnd = season.actualHarvestDate ?? season.expectedHarvestDate;
		if (seasonEnd) {
			const seasonEndTime = this.dateToEpoch(seasonEnd);
			if (activityTime > seasonEndTime) {
				throw new BadRequestException(
					'Activity date must fall within the planting season timeframe'
				);
			}
		}
	}

	private ensureActivityAllowedForCrop(
		season: PlantingSeason,
		activityType: ActivityType
	) {
		const allowedActivities = CROP_ACTIVITY_RULES[season.cropType];
		if (allowedActivities && !allowedActivities.includes(activityType)) {
			throw new BadRequestException(
				`Activity type "${activityType}" is not allowed for crop ${season.cropType}`
			);
		}

		if (
			activityType === ActivityType.HARVESTING &&
			season.status !== PlantingSeasonStatus.ACTIVE
		) {
			throw new BadRequestException(
				'Harvest activities can only be logged for active seasons'
			);
		}
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
				'Planting season not found for this field'
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

	private dateToEpoch(date: string): number {
		return new Date(date).getTime();
	}
}
