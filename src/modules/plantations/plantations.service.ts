import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Plantation } from '../../entities/plantation.entity';
import { User } from '../../entities/user.entity';

import { CreatePlantationDto } from './dto/create-plantation.dto';

@Injectable()
export class PlantationsService {
  constructor(
    @InjectRepository(Plantation)
    private readonly plantationsRepository: Repository<Plantation>,
  ) { }

  async create(ownerId: string, dto: CreatePlantationDto) {
    const plantation = this.plantationsRepository.create({
      ...dto,
      owner: { id: ownerId } as User,
    });
    return this.plantationsRepository.save(plantation);
  }

  findAll(ownerId: string) {
    return this.plantationsRepository.find({
      where: { owner: { id: ownerId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(ownerId: string, plantationId: string) {
    return this.getOwnedPlantation(ownerId, plantationId);
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
