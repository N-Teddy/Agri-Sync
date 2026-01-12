import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Field } from '../../entities/field.entity';
import { SyncEntity } from '../sync/dto/sync.dto';
import { SyncService } from '../sync/sync.service';
import { CreateFieldDto } from './dto/create-field.dto';
import { UpdateFieldDto } from './dto/update-field.dto';
import { PlantationsService } from './plantations.service';
import { calculateFieldAreaHectares } from './utils/field-geometry.util';

const MAX_FIELDS_PER_PLANTATION = 5;

@Injectable()
export class PlantationFieldsService {
	constructor(
		@InjectRepository(Field)
		private readonly fieldsRepository: Repository<Field>,
		private readonly plantationsService: PlantationsService,
		private readonly syncService: SyncService
	) {}

	async createField(
		ownerId: string,
		plantationId: string,
		dto: CreateFieldDto
	) {
		const plantation = await this.plantationsService.getOwnedPlantation(
			ownerId,
			plantationId
		);

		await this.ensureFieldLimitNotReached(plantation.id);

		const areaHectares = calculateFieldAreaHectares(dto.boundary);

		const field = this.fieldsRepository.create({
			plantation,
			name: dto.name,
			soilType: dto.soilType,
			boundary: dto.boundary as unknown as Record<string, unknown>,
			areaHectares: areaHectares.toFixed(2),
			isArchived: false,
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

	async updateField(
		ownerId: string,
		plantationId: string,
		fieldId: string,
		dto: UpdateFieldDto
	) {
		const field = await this.getField(ownerId, plantationId, fieldId);
		if (dto.isArchived === false && field.isArchived) {
			await this.ensureFieldLimitNotReached(plantationId);
		}
		if (dto.name !== undefined) {
			field.name = dto.name;
		}
		if (dto.soilType !== undefined) {
			field.soilType = dto.soilType ?? null;
		}
		if (dto.boundary !== undefined && dto.boundary !== null) {
			const areaHectares = calculateFieldAreaHectares(dto.boundary);
			field.boundary = dto.boundary as unknown as Record<string, unknown>;
			field.areaHectares = areaHectares.toFixed(2);
		}
		if (dto.isArchived !== undefined) {
			field.isArchived = dto.isArchived;
		}
		return this.fieldsRepository.save(field);
	}

	async deleteField(
		ownerId: string,
		plantationId: string,
		fieldId: string
	) {
		const field = await this.getField(ownerId, plantationId, fieldId);
		await this.fieldsRepository.remove(field);
		await this.syncService.recordDeletion(
			ownerId,
			SyncEntity.FIELD,
			fieldId
		);
		return { deleted: true };
	}

	private async ensureFieldLimitNotReached(plantationId: string) {
		const count = await this.fieldsRepository.count({
			where: { plantation: { id: plantationId }, isArchived: false },
		});

		if (count >= MAX_FIELDS_PER_PLANTATION) {
			throw new BadRequestException(
				`A maximum of ${MAX_FIELDS_PER_PLANTATION} fields is allowed per plantation`
			);
		}
	}
}
