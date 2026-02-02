import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';

import { CropType } from '../../common/enums/crop-type.enum';
import { Field } from '../../entities/field.entity';
import { FieldActivity } from '../../entities/field-activity.entity';
import { FinancialRecord } from '../../entities/financial-record.entity';
import { Plantation } from '../../entities/plantation.entity';
import { PlantingSeason } from '../../entities/planting-season.entity';
import { ActivityPhoto } from '../../entities/activity-photo.entity';
import { SyncTombstone } from '../../entities/sync-tombstone.entity';
import { SyncEntity, SyncOperation, SyncOperationDto } from './dto/sync.dto';

const CROP_TYPE_VALUES = new Set(Object.values(CropType));

const normalizeCropType = (
	value: string | null | undefined
): CropType | null | undefined => {
	if (value === null || value === undefined) {
		return value;
	}
	if (value === '') {
		return undefined;
	}
	return CROP_TYPE_VALUES.has(value as CropType)
		? (value as CropType)
		: undefined;
};

const isInvalidCropType = (value: string | null | undefined) =>
	value !== undefined &&
	value !== null &&
	value !== '' &&
	normalizeCropType(value) === undefined;

export interface SyncConflict {
	operationId?: string;
	entity: SyncEntity;
	operation: SyncOperation;
	clientUpdatedAt: string;
	payload: Record<string, unknown>;
	serverRecord?: Record<string, unknown>;
	reason: string;
}

export interface SyncPushResult {
	appliedOperationIds: string[];
	conflicts: SyncConflict[];
	serverTime: string;
}

export interface SyncPullResult {
	serverTime: string;
	data: {
		plantations: Record<string, unknown>[];
		fields: Record<string, unknown>[];
		plantingSeasons: Record<string, unknown>[];
		activities: Record<string, unknown>[];
		financialRecords: Record<string, unknown>[];
		activityPhotos: Record<string, unknown>[];
	};
	deletions: Array<{
		entity: SyncEntity;
		id: string;
		deletedAt: string;
	}>;
}

@Injectable()
export class SyncService {
	constructor(
		@InjectRepository(Plantation)
		private readonly plantationsRepository: Repository<Plantation>,
		@InjectRepository(Field)
		private readonly fieldsRepository: Repository<Field>,
		@InjectRepository(PlantingSeason)
		private readonly seasonsRepository: Repository<PlantingSeason>,
		@InjectRepository(FieldActivity)
		private readonly activitiesRepository: Repository<FieldActivity>,
		@InjectRepository(FinancialRecord)
		private readonly financialRepository: Repository<FinancialRecord>,
		@InjectRepository(ActivityPhoto)
		private readonly photosRepository: Repository<ActivityPhoto>,
		@InjectRepository(SyncTombstone)
		private readonly tombstonesRepository: Repository<SyncTombstone>
	) {}

	async recordDeletion(
		userId: string,
		entityType: SyncEntity,
		entityId: string
	) {
		const tombstone = this.tombstonesRepository.create({
			userId,
			entityType,
			entityId,
		});
		await this.tombstonesRepository.save(tombstone);
	}

	async push(
		userId: string,
		operations: SyncOperationDto[]
	): Promise<SyncPushResult> {
		const appliedOperationIds: string[] = [];
		const conflicts: SyncConflict[] = [];
		for (const operation of operations) {
			const opId = operation.operationId;
			try {
				const result = await this.applyOperation(userId, operation);
				if (result === 'applied') {
					if (opId) {
						appliedOperationIds.push(opId);
					}
				} else if (result) {
					conflicts.push(result);
				}
			} catch (error) {
				conflicts.push({
					operationId: opId,
					entity: operation.entity,
					operation: operation.operation,
					clientUpdatedAt: operation.clientUpdatedAt,
					payload: operation.payload,
					reason:
						error instanceof Error
							? error.message
							: 'Unable to apply change',
				});
			}
		}

		return {
			appliedOperationIds,
			conflicts,
			serverTime: new Date().toISOString(),
		};
	}

	async pull(userId: string, since?: string): Promise<SyncPullResult> {
		const sinceDate = since ? new Date(since) : new Date(0);

		const plantations = await this.plantationsRepository.find({
			where: { owner: { id: userId }, updatedAt: MoreThan(sinceDate) },
		});

		const fields = await this.fieldsRepository
			.createQueryBuilder('field')
			.leftJoin('field.plantation', 'plantation')
			.leftJoin('plantation.owner', 'owner')
			.where('owner.id = :userId', { userId })
			.andWhere('field.updatedAt > :since', { since: sinceDate })
			.getMany();

		const seasons = await this.seasonsRepository
			.createQueryBuilder('season')
			.leftJoin('season.field', 'field')
			.leftJoin('field.plantation', 'plantation')
			.leftJoin('plantation.owner', 'owner')
			.where('owner.id = :userId', { userId })
			.andWhere('season.updatedAt > :since', { since: sinceDate })
			.getMany();

		const activities = await this.activitiesRepository
			.createQueryBuilder('activity')
			.leftJoin('activity.field', 'field')
			.leftJoin('field.plantation', 'plantation')
			.leftJoin('plantation.owner', 'owner')
			.where('owner.id = :userId', { userId })
			.andWhere('activity.updatedAt > :since', { since: sinceDate })
			.getMany();

		const financialRecords = await this.financialRepository
			.createQueryBuilder('record')
			.leftJoin('record.field', 'field')
			.leftJoin('field.plantation', 'plantation')
			.leftJoin('plantation.owner', 'owner')
			.where('owner.id = :userId', { userId })
			.andWhere('record.updatedAt > :since', { since: sinceDate })
			.getMany();

		const activityPhotos = await this.photosRepository
			.createQueryBuilder('photo')
			.leftJoin('photo.activity', 'activity')
			.leftJoin('activity.field', 'field')
			.leftJoin('field.plantation', 'plantation')
			.leftJoin('plantation.owner', 'owner')
			.where('owner.id = :userId', { userId })
			.andWhere('photo.updatedAt > :since', { since: sinceDate })
			.getMany();

		const deletions = await this.tombstonesRepository.find({
			where: { userId, deletedAt: MoreThan(sinceDate) },
			order: { deletedAt: 'ASC' },
		});

		return {
			serverTime: new Date().toISOString(),
			data: {
				plantations: plantations.map((plantation) => ({
					id: plantation.id,
					name: plantation.name,
					location: plantation.location,
					region: plantation.region,
					isArchived: plantation.isArchived,
					createdAt: plantation.createdAt,
					updatedAt: plantation.updatedAt,
				})),
				fields: fields.map((field) => ({
					id: field.id,
					name: field.name,
					soilType: field.soilType,
					boundary: field.boundary,
					areaHectares: field.areaHectares,
					isArchived: field.isArchived,
					currentCrop: field.currentCrop,
					plantationId: field.plantation?.id,
					createdAt: field.createdAt,
					updatedAt: field.updatedAt,
				})),
				plantingSeasons: seasons.map((season) => ({
					id: season.id,
					fieldId: season.field?.id,
					cropType: season.cropType,
					plantingDate: season.plantingDate,
					expectedHarvestDate: season.expectedHarvestDate,
					actualHarvestDate: season.actualHarvestDate,
					yieldKg: season.yieldKg,
					status: season.status,
					growthStage: season.growthStage,
					createdAt: season.createdAt,
					updatedAt: season.updatedAt,
				})),
				activities: activities.map((activity) => ({
					id: activity.id,
					fieldId: activity.field?.id,
					plantingSeasonId: activity.plantingSeason?.id ?? null,
					activityType: activity.activityType,
					activityDate: activity.activityDate,
					notes: activity.notes,
					inputProduct: activity.inputProduct,
					inputCostXaf: activity.inputCostXaf,
					createdAt: activity.createdAt,
					updatedAt: activity.updatedAt,
				})),
				financialRecords: financialRecords.map((record) => ({
					id: record.id,
					fieldId: record.field?.id,
					recordType: record.recordType,
					amountXaf: record.amountXaf,
					recordDate: record.recordDate,
					description: record.description,
					productName: record.productName,
					quantityKg: record.quantityKg,
					pricePerKgXaf: record.pricePerKgXaf,
					cropType: record.cropType,
					createdAt: record.createdAt,
					updatedAt: record.updatedAt,
				})),
				activityPhotos: activityPhotos.map((photo) => ({
					id: photo.id,
					activityId: photo.activity?.id,
					photoUrl: photo.photoUrl,
					publicId: photo.publicId,
					caption: photo.caption,
					width: photo.width,
					height: photo.height,
					fileSize: photo.fileSize,
					takenAt: photo.takenAt,
					createdAt: photo.createdAt,
					updatedAt: photo.updatedAt,
				})),
			},
			deletions: deletions.map((item) => ({
				entity: item.entityType as SyncEntity,
				id: item.entityId,
				deletedAt: item.deletedAt.toISOString(),
			})),
		};
	}

	private async applyOperation(
		userId: string,
		operation: SyncOperationDto
	): Promise<'applied' | SyncConflict | null> {
		switch (operation.entity) {
			case SyncEntity.PLANTATION:
				return this.applyPlantationOperation(userId, operation);
			case SyncEntity.FIELD:
				return this.applyFieldOperation(userId, operation);
			case SyncEntity.PLANTING_SEASON:
				return this.applySeasonOperation(userId, operation);
			case SyncEntity.ACTIVITY:
				return this.applyActivityOperation(userId, operation);
			case SyncEntity.FINANCIAL_RECORD:
				return this.applyFinancialOperation(userId, operation);
			case SyncEntity.ACTIVITY_PHOTO:
				return this.applyPhotoOperation(userId, operation);
			default:
				return null;
		}
	}

	private buildConflict(
		operation: SyncOperationDto,
		serverRecord: Record<string, unknown>,
		reason: string
	): SyncConflict {
		return {
			operationId: operation.operationId,
			entity: operation.entity,
			operation: operation.operation,
			clientUpdatedAt: operation.clientUpdatedAt,
			payload: operation.payload,
			serverRecord,
			reason,
		};
	}

	private isConflict(
		serverUpdatedAt: Date,
		clientUpdatedAt: string
	): boolean {
		const clientDate = new Date(clientUpdatedAt);
		if (Number.isNaN(clientDate.getTime())) {
			return true;
		}
		return serverUpdatedAt.getTime() > clientDate.getTime();
	}

	private async applyPlantationOperation(
		userId: string,
		operation: SyncOperationDto
	): Promise<'applied' | SyncConflict> {
		const payload = operation.payload as {
			id?: string;
			name?: string;
			location?: string;
			region?: string;
			isArchived?: boolean;
		};
		const plantationId = payload.id;

		if (operation.operation === SyncOperation.CREATE) {
			if (!plantationId) {
				return this.buildConflict(
					operation,
					{},
					'Missing plantation id'
				);
			}
			const existing = await this.plantationsRepository.findOne({
				where: { id: plantationId },
			});
			if (existing) {
				return this.buildConflict(
					operation,
					this.serializePlantation(existing),
					'Plantation already exists'
				);
			}
			const plantation = this.plantationsRepository.create({
				id: plantationId,
				name: payload.name ?? 'Untitled plantation',
				location: payload.location ?? '',
				region: payload.region ?? '',
				isArchived: payload.isArchived ?? false,
				owner: { id: userId } as Plantation['owner'],
			});
			await this.plantationsRepository.save(plantation);
			return 'applied';
		}

		if (!plantationId) {
			return this.buildConflict(operation, {}, 'Missing plantation id');
		}

		const plantation = await this.plantationsRepository.findOne({
			where: { id: plantationId, owner: { id: userId } },
		});
		if (!plantation) {
			return this.buildConflict(operation, {}, 'Plantation not found');
		}

		if (this.isConflict(plantation.updatedAt, operation.clientUpdatedAt)) {
			return this.buildConflict(
				operation,
				this.serializePlantation(plantation),
				'Plantation has newer updates on the server'
			);
		}

		if (operation.operation === SyncOperation.UPDATE) {
			plantation.name = payload.name ?? plantation.name;
			plantation.location = payload.location ?? plantation.location;
			plantation.region = payload.region ?? plantation.region;
			if (payload.isArchived !== undefined) {
				plantation.isArchived = payload.isArchived;
			}
			await this.plantationsRepository.save(plantation);
			return 'applied';
		}

		if (operation.operation === SyncOperation.DELETE) {
			await this.plantationsRepository.remove(plantation);
			await this.recordDeletion(
				userId,
				SyncEntity.PLANTATION,
				plantationId
			);
			return 'applied';
		}

		return this.buildConflict(
			operation,
			this.serializePlantation(plantation),
			'Unsupported operation'
		);
	}

	private async applyFieldOperation(
		userId: string,
		operation: SyncOperationDto
	): Promise<'applied' | SyncConflict> {
		const payload = operation.payload as {
			id?: string;
			plantationId?: string;
			name?: string;
			soilType?: string | null;
			boundary?: Record<string, unknown>;
			isArchived?: boolean;
			currentCrop?: string | null;
		};
		const fieldId = payload.id;
		const normalizedCurrentCrop = normalizeCropType(payload.currentCrop);

		if (operation.operation === SyncOperation.CREATE) {
			if (!fieldId || !payload.plantationId) {
				return this.buildConflict(
					operation,
					{},
					'Missing field identifiers'
				);
			}
			if (isInvalidCropType(payload.currentCrop)) {
				return this.buildConflict(
					operation,
					{},
					'Invalid current crop value'
				);
			}
			const existing = await this.fieldsRepository.findOne({
				where: { id: fieldId },
			});
			if (existing) {
				return this.buildConflict(
					operation,
					this.serializeField(existing),
					'Field already exists'
				);
			}
			const plantation = await this.plantationsRepository.findOne({
				where: { id: payload.plantationId, owner: { id: userId } },
			});
			if (!plantation) {
				return this.buildConflict(
					operation,
					{},
					'Plantation not found'
				);
			}
			const field = this.fieldsRepository.create({
				id: fieldId,
				name: payload.name ?? 'Untitled field',
				soilType:
					payload.soilType !== undefined
						? payload.soilType
						: undefined,
				boundary: payload.boundary,
				isArchived: payload.isArchived ?? false,
				currentCrop: normalizedCurrentCrop,
				plantation,
			});
			await this.fieldsRepository.save(field);
			return 'applied';
		}

		if (!fieldId) {
			return this.buildConflict(operation, {}, 'Missing field id');
		}

		const field = await this.fieldsRepository
			.createQueryBuilder('field')
			.leftJoinAndSelect('field.plantation', 'plantation')
			.leftJoin('plantation.owner', 'owner')
			.where('field.id = :id', { id: fieldId })
			.andWhere('owner.id = :userId', { userId })
			.getOne();

		if (!field) {
			return this.buildConflict(operation, {}, 'Field not found');
		}

		if (this.isConflict(field.updatedAt, operation.clientUpdatedAt)) {
			return this.buildConflict(
				operation,
				this.serializeField(field),
				'Field has newer updates on the server'
			);
		}

		if (operation.operation === SyncOperation.UPDATE) {
			if (isInvalidCropType(payload.currentCrop)) {
				return this.buildConflict(
					operation,
					this.serializeField(field),
					'Invalid current crop value'
				);
			}
			field.name = payload.name ?? field.name;
			field.soilType =
				payload.soilType !== undefined
					? payload.soilType
					: field.soilType;
			field.boundary = payload.boundary ?? field.boundary;
			field.isArchived = payload.isArchived ?? field.isArchived ?? false;
			if (
				payload.currentCrop !== undefined &&
				payload.currentCrop !== ''
			) {
				field.currentCrop = normalizedCurrentCrop;
			}
			await this.fieldsRepository.save(field);
			return 'applied';
		}

		if (operation.operation === SyncOperation.DELETE) {
			await this.fieldsRepository.remove(field);
			await this.recordDeletion(userId, SyncEntity.FIELD, fieldId);
			return 'applied';
		}

		return this.buildConflict(
			operation,
			this.serializeField(field),
			'Unsupported operation'
		);
	}

	private async applySeasonOperation(
		userId: string,
		operation: SyncOperationDto
	): Promise<'applied' | SyncConflict> {
		const payload = operation.payload as {
			id?: string;
			fieldId?: string;
			cropType?: string;
			plantingDate?: string;
			expectedHarvestDate?: string;
			actualHarvestDate?: string;
			yieldKg?: string | number;
			status?: string;
			growthStage?: string;
		};
		const seasonId = payload.id;

		if (operation.operation === SyncOperation.CREATE) {
			if (!seasonId || !payload.fieldId) {
				return this.buildConflict(
					operation,
					{},
					'Missing season identifiers'
				);
			}
			const existing = await this.seasonsRepository.findOne({
				where: { id: seasonId },
			});
			if (existing) {
				return this.buildConflict(
					operation,
					this.serializeSeason(existing),
					'Season already exists'
				);
			}
			const field = await this.fieldsRepository
				.createQueryBuilder('field')
				.leftJoin('field.plantation', 'plantation')
				.leftJoin('plantation.owner', 'owner')
				.where('field.id = :id', { id: payload.fieldId })
				.andWhere('owner.id = :userId', { userId })
				.getOne();
			if (!field) {
				return this.buildConflict(operation, {}, 'Field not found');
			}
			const season = this.seasonsRepository.create({
				id: seasonId,
				field,
				cropType: payload.cropType as PlantingSeason['cropType'],
				plantingDate: payload.plantingDate ?? '',
				expectedHarvestDate: payload.expectedHarvestDate,
				actualHarvestDate: payload.actualHarvestDate,
				yieldKg:
					payload.yieldKg !== undefined
						? String(payload.yieldKg)
						: undefined,
				status: payload.status as PlantingSeason['status'],
				growthStage: payload.growthStage,
			});
			await this.seasonsRepository.save(season);
			return 'applied';
		}

		if (!seasonId) {
			return this.buildConflict(operation, {}, 'Missing season id');
		}

		const season = await this.seasonsRepository
			.createQueryBuilder('season')
			.leftJoinAndSelect('season.field', 'field')
			.leftJoin('field.plantation', 'plantation')
			.leftJoin('plantation.owner', 'owner')
			.where('season.id = :id', { id: seasonId })
			.andWhere('owner.id = :userId', { userId })
			.getOne();

		if (!season) {
			return this.buildConflict(operation, {}, 'Season not found');
		}

		if (this.isConflict(season.updatedAt, operation.clientUpdatedAt)) {
			return this.buildConflict(
				operation,
				this.serializeSeason(season),
				'Season has newer updates on the server'
			);
		}

		if (operation.operation === SyncOperation.UPDATE) {
			season.cropType =
				(payload.cropType as PlantingSeason['cropType']) ??
				season.cropType;
			season.plantingDate = payload.plantingDate ?? season.plantingDate;
			season.expectedHarvestDate =
				payload.expectedHarvestDate ?? season.expectedHarvestDate;
			season.actualHarvestDate =
				payload.actualHarvestDate ?? season.actualHarvestDate;
			season.yieldKg =
				payload.yieldKg !== undefined
					? String(payload.yieldKg)
					: season.yieldKg;
			season.status =
				(payload.status as PlantingSeason['status']) ?? season.status;
			season.growthStage = payload.growthStage ?? season.growthStage;
			await this.seasonsRepository.save(season);
			return 'applied';
		}

		if (operation.operation === SyncOperation.DELETE) {
			await this.seasonsRepository.remove(season);
			await this.recordDeletion(
				userId,
				SyncEntity.PLANTING_SEASON,
				seasonId
			);
			return 'applied';
		}

		return this.buildConflict(
			operation,
			this.serializeSeason(season),
			'Unsupported operation'
		);
	}

	private async applyActivityOperation(
		userId: string,
		operation: SyncOperationDto
	): Promise<'applied' | SyncConflict> {
		const payload = operation.payload as {
			id?: string;
			fieldId?: string;
			plantingSeasonId?: string | null;
			activityType?: string;
			activityDate?: string;
			notes?: string;
			inputProduct?: string;
			inputCostXaf?: string | number;
		};
		const activityId = payload.id;

		if (operation.operation === SyncOperation.CREATE) {
			if (!activityId || !payload.fieldId) {
				return this.buildConflict(
					operation,
					{},
					'Missing activity identifiers'
				);
			}
			const existing = await this.activitiesRepository.findOne({
				where: { id: activityId },
			});
			if (existing) {
				return this.buildConflict(
					operation,
					this.serializeActivity(existing),
					'Activity already exists'
				);
			}
			const field = await this.fieldsRepository
				.createQueryBuilder('field')
				.leftJoin('field.plantation', 'plantation')
				.leftJoin('plantation.owner', 'owner')
				.where('field.id = :id', { id: payload.fieldId })
				.andWhere('owner.id = :userId', { userId })
				.getOne();
			if (!field) {
				return this.buildConflict(operation, {}, 'Field not found');
			}
			const plantingSeason = payload.plantingSeasonId
				? await this.seasonsRepository.findOne({
						where: { id: payload.plantingSeasonId },
					})
				: undefined;
			const activity = this.activitiesRepository.create({
				id: activityId,
				field,
				plantingSeason: plantingSeason ?? undefined,
				activityType:
					payload.activityType as FieldActivity['activityType'],
				activityDate: payload.activityDate ?? '',
				notes: payload.notes,
				inputProduct: payload.inputProduct,
				inputCostXaf:
					payload.inputCostXaf !== undefined
						? String(payload.inputCostXaf)
						: undefined,
			});
			await this.activitiesRepository.save(activity);
			return 'applied';
		}

		if (!activityId) {
			return this.buildConflict(operation, {}, 'Missing activity id');
		}

		const activity = await this.activitiesRepository
			.createQueryBuilder('activity')
			.leftJoinAndSelect('activity.field', 'field')
			.leftJoin('field.plantation', 'plantation')
			.leftJoin('plantation.owner', 'owner')
			.where('activity.id = :id', { id: activityId })
			.andWhere('owner.id = :userId', { userId })
			.getOne();

		if (!activity) {
			return this.buildConflict(operation, {}, 'Activity not found');
		}

		if (this.isConflict(activity.updatedAt, operation.clientUpdatedAt)) {
			return this.buildConflict(
				operation,
				this.serializeActivity(activity),
				'Activity has newer updates on the server'
			);
		}

		if (operation.operation === SyncOperation.UPDATE) {
			activity.activityType =
				(payload.activityType as FieldActivity['activityType']) ??
				activity.activityType;
			activity.activityDate =
				payload.activityDate ?? activity.activityDate;
			activity.notes = payload.notes ?? activity.notes;
			activity.inputProduct =
				payload.inputProduct ?? activity.inputProduct;
			activity.inputCostXaf =
				payload.inputCostXaf !== undefined
					? String(payload.inputCostXaf)
					: activity.inputCostXaf;
			if (payload.plantingSeasonId !== undefined) {
				const plantingSeason = payload.plantingSeasonId
					? await this.seasonsRepository.findOne({
							where: { id: payload.plantingSeasonId },
						})
					: undefined;
				activity.plantingSeason = plantingSeason ?? undefined;
			}
			await this.activitiesRepository.save(activity);
			return 'applied';
		}

		if (operation.operation === SyncOperation.DELETE) {
			await this.activitiesRepository.remove(activity);
			await this.recordDeletion(userId, SyncEntity.ACTIVITY, activityId);
			return 'applied';
		}

		return this.buildConflict(
			operation,
			this.serializeActivity(activity),
			'Unsupported operation'
		);
	}

	private async applyFinancialOperation(
		userId: string,
		operation: SyncOperationDto
	): Promise<'applied' | SyncConflict> {
		const payload = operation.payload as {
			id?: string;
			fieldId?: string;
			recordType?: string;
			amountXaf?: string | number;
			recordDate?: string;
			description?: string;
			productName?: string;
			quantityKg?: string | number;
			pricePerKgXaf?: string | number;
			cropType?: string;
		};
		const recordId = payload.id;

		if (operation.operation === SyncOperation.CREATE) {
			if (!recordId || !payload.fieldId) {
				return this.buildConflict(
					operation,
					{},
					'Missing financial record id'
				);
			}
			const existing = await this.financialRepository.findOne({
				where: { id: recordId },
			});
			if (existing) {
				return this.buildConflict(
					operation,
					this.serializeFinancial(existing),
					'Financial record already exists'
				);
			}
			const field = await this.fieldsRepository
				.createQueryBuilder('field')
				.leftJoin('field.plantation', 'plantation')
				.leftJoin('plantation.owner', 'owner')
				.where('field.id = :id', { id: payload.fieldId })
				.andWhere('owner.id = :userId', { userId })
				.getOne();
			if (!field) {
				return this.buildConflict(operation, {}, 'Field not found');
			}
			const record = this.financialRepository.create({
				id: recordId,
				field,
				recordType: payload.recordType as FinancialRecord['recordType'],
				amountXaf:
					payload.amountXaf !== undefined
						? String(payload.amountXaf)
						: '0',
				recordDate: payload.recordDate ?? '',
				description: payload.description,
				productName: payload.productName,
				quantityKg:
					payload.quantityKg !== undefined
						? String(payload.quantityKg)
						: undefined,
				pricePerKgXaf:
					payload.pricePerKgXaf !== undefined
						? String(payload.pricePerKgXaf)
						: undefined,
				cropType: payload.cropType as FinancialRecord['cropType'],
			});
			await this.financialRepository.save(record);
			return 'applied';
		}

		if (!recordId) {
			return this.buildConflict(
				operation,
				{},
				'Missing financial record id'
			);
		}

		const record = await this.financialRepository
			.createQueryBuilder('record')
			.leftJoinAndSelect('record.field', 'field')
			.leftJoin('field.plantation', 'plantation')
			.leftJoin('plantation.owner', 'owner')
			.where('record.id = :id', { id: recordId })
			.andWhere('owner.id = :userId', { userId })
			.getOne();

		if (!record) {
			return this.buildConflict(
				operation,
				{},
				'Financial record not found'
			);
		}

		if (this.isConflict(record.updatedAt, operation.clientUpdatedAt)) {
			return this.buildConflict(
				operation,
				this.serializeFinancial(record),
				'Financial record has newer updates on the server'
			);
		}

		if (operation.operation === SyncOperation.UPDATE) {
			record.amountXaf =
				payload.amountXaf !== undefined
					? String(payload.amountXaf)
					: record.amountXaf;
			record.recordDate = payload.recordDate ?? record.recordDate;
			record.description = payload.description ?? record.description;
			record.productName = payload.productName ?? record.productName;
			record.quantityKg =
				payload.quantityKg !== undefined
					? String(payload.quantityKg)
					: record.quantityKg;
			record.pricePerKgXaf =
				payload.pricePerKgXaf !== undefined
					? String(payload.pricePerKgXaf)
					: record.pricePerKgXaf;
			record.cropType =
				(payload.cropType as FinancialRecord['cropType']) ??
				record.cropType;
			await this.financialRepository.save(record);
			return 'applied';
		}

		if (operation.operation === SyncOperation.DELETE) {
			await this.financialRepository.remove(record);
			await this.recordDeletion(
				userId,
				SyncEntity.FINANCIAL_RECORD,
				recordId
			);
			return 'applied';
		}

		return this.buildConflict(
			operation,
			this.serializeFinancial(record),
			'Unsupported operation'
		);
	}

	private async applyPhotoOperation(
		userId: string,
		operation: SyncOperationDto
	): Promise<'applied' | SyncConflict> {
		const payload = operation.payload as {
			id?: string;
			activityId?: string;
			photoUrl?: string;
			publicId?: string;
			caption?: string;
			width?: number;
			height?: number;
			fileSize?: number;
			takenAt?: string;
		};
		const photoId = payload.id;

		if (operation.operation === SyncOperation.CREATE) {
			if (!photoId || !payload.activityId || !payload.photoUrl) {
				return this.buildConflict(
					operation,
					{},
					'Missing photo identifiers'
				);
			}
			const existing = await this.photosRepository.findOne({
				where: { id: photoId },
			});
			if (existing) {
				return this.buildConflict(
					operation,
					this.serializePhoto(existing),
					'Photo already exists'
				);
			}
			const activity = await this.activitiesRepository
				.createQueryBuilder('activity')
				.leftJoin('activity.field', 'field')
				.leftJoin('field.plantation', 'plantation')
				.leftJoin('plantation.owner', 'owner')
				.where('activity.id = :id', { id: payload.activityId })
				.andWhere('owner.id = :userId', { userId })
				.getOne();
			if (!activity) {
				return this.buildConflict(operation, {}, 'Activity not found');
			}
			const photo = this.photosRepository.create({
				id: photoId,
				activity,
				photoUrl: payload.photoUrl,
				publicId: payload.publicId,
				caption: payload.caption,
				width: payload.width,
				height: payload.height,
				fileSize: payload.fileSize,
				takenAt: payload.takenAt
					? new Date(payload.takenAt)
					: undefined,
			});
			await this.photosRepository.save(photo);
			return 'applied';
		}

		if (!photoId) {
			return this.buildConflict(operation, {}, 'Missing photo id');
		}

		const photo = await this.photosRepository
			.createQueryBuilder('photo')
			.leftJoinAndSelect('photo.activity', 'activity')
			.leftJoin('activity.field', 'field')
			.leftJoin('field.plantation', 'plantation')
			.leftJoin('plantation.owner', 'owner')
			.where('photo.id = :id', { id: photoId })
			.andWhere('owner.id = :userId', { userId })
			.getOne();

		if (!photo) {
			return this.buildConflict(operation, {}, 'Photo not found');
		}

		if (this.isConflict(photo.updatedAt, operation.clientUpdatedAt)) {
			return this.buildConflict(
				operation,
				this.serializePhoto(photo),
				'Photo has newer updates on the server'
			);
		}

		if (operation.operation === SyncOperation.UPDATE) {
			photo.caption = payload.caption ?? photo.caption;
			await this.photosRepository.save(photo);
			return 'applied';
		}

		if (operation.operation === SyncOperation.DELETE) {
			await this.photosRepository.remove(photo);
			await this.recordDeletion(
				userId,
				SyncEntity.ACTIVITY_PHOTO,
				photoId
			);
			return 'applied';
		}

		return this.buildConflict(
			operation,
			this.serializePhoto(photo),
			'Unsupported operation'
		);
	}

	private serializePlantation(plantation: Plantation) {
		return {
			id: plantation.id,
			name: plantation.name,
			location: plantation.location,
			region: plantation.region,
			isArchived: plantation.isArchived,
			updatedAt: plantation.updatedAt,
		};
	}

	private serializeField(field: Field) {
		return {
			id: field.id,
			name: field.name,
			plantationId: field.plantation?.id,
			soilType: field.soilType,
			boundary: field.boundary,
			isArchived: field.isArchived,
			currentCrop: field.currentCrop,
			updatedAt: field.updatedAt,
		};
	}

	private serializeSeason(season: PlantingSeason) {
		return {
			id: season.id,
			fieldId: season.field?.id,
			cropType: season.cropType,
			plantingDate: season.plantingDate,
			expectedHarvestDate: season.expectedHarvestDate,
			actualHarvestDate: season.actualHarvestDate,
			yieldKg: season.yieldKg,
			status: season.status,
			updatedAt: season.updatedAt,
		};
	}

	private serializeActivity(activity: FieldActivity) {
		return {
			id: activity.id,
			fieldId: activity.field?.id,
			plantingSeasonId: activity.plantingSeason?.id,
			activityType: activity.activityType,
			activityDate: activity.activityDate,
			notes: activity.notes,
			inputProduct: activity.inputProduct,
			inputCostXaf: activity.inputCostXaf,
			updatedAt: activity.updatedAt,
		};
	}

	private serializeFinancial(record: FinancialRecord) {
		return {
			id: record.id,
			fieldId: record.field?.id,
			recordType: record.recordType,
			amountXaf: record.amountXaf,
			recordDate: record.recordDate,
			description: record.description,
			productName: record.productName,
			quantityKg: record.quantityKg,
			pricePerKgXaf: record.pricePerKgXaf,
			cropType: record.cropType,
			updatedAt: record.updatedAt,
		};
	}

	private serializePhoto(photo: ActivityPhoto) {
		return {
			id: photo.id,
			activityId: photo.activity?.id,
			photoUrl: photo.photoUrl,
			publicId: photo.publicId,
			caption: photo.caption,
			width: photo.width,
			height: photo.height,
			fileSize: photo.fileSize,
			takenAt: photo.takenAt,
			updatedAt: photo.updatedAt,
		};
	}
}
