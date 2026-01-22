import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Plantation } from '../../entities/plantation.entity';
import { User } from '../../entities/user.entity';
import { SyncEntity } from '../sync/dto/sync.dto';
import { SyncService } from '../sync/sync.service';
import { CreatePlantationDto } from './dto/create-plantation.dto';
import { UpdatePlantationDto } from './dto/update-plantation.dto';

@Injectable()
export class PlantationsService {
	constructor(
		@InjectRepository(Plantation)
		private readonly plantationsRepository: Repository<Plantation>,
		private readonly syncService: SyncService
	) {}

	async create(ownerId: string, dto: CreatePlantationDto) {
		const plantation = this.plantationsRepository.create({
			...dto,
			isArchived: false,
			owner: { id: ownerId } as User,
		});
		return this.plantationsRepository.save(plantation);
	}

	findAll(ownerId: string) {
		return this.plantationsRepository.find({
			where: { owner: { id: ownerId }, isArchived: false },
			order: { createdAt: 'DESC' },
		});
	}

	async findOne(ownerId: string, plantationId: string) {
		return this.getOwnedPlantation(ownerId, plantationId);
	}

	async update(
		ownerId: string,
		plantationId: string,
		dto: UpdatePlantationDto
	) {
		const plantation = await this.getOwnedPlantation(ownerId, plantationId);
		if (dto.name !== undefined) {
			plantation.name = dto.name;
		}
		if (dto.location !== undefined) {
			plantation.location = dto.location;
		}
		if (dto.region !== undefined) {
			plantation.region = dto.region;
		}
		if (dto.isArchived !== undefined) {
			plantation.isArchived = dto.isArchived;
		}
		return this.plantationsRepository.save(plantation);
	}

	async remove(ownerId: string, plantationId: string) {
		const plantation = await this.getOwnedPlantation(ownerId, plantationId);
		await this.plantationsRepository.remove(plantation);
		await this.syncService.recordDeletion(
			ownerId,
			SyncEntity.PLANTATION,
			plantationId
		);
		return { deleted: true };
	}

	async getOwnedPlantation(ownerId: string, plantationId: string) {
		const plantation = await this.plantationsRepository.findOne({
			where: { id: plantationId, owner: { id: ownerId } },
		});

		if (!plantation) {
			throw new NotFoundException('Plantation not found');
		}

		return plantation;
	}
}
