import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { Plantation } from '../../../src/entities/plantation.entity';
import { User } from '../../../src/entities/user.entity';
import { PlantationsService } from '../../../src/modules/plantations/plantations.service';
import { TestConfigModule } from '../../utils/test-config.module';
import { SqliteTestingModule } from '../../utils/sqlite-testing.module';

describe('PlantationsService', () => {
  let service: PlantationsService;
  let usersRepo: Repository<User>;
  let plantationsRepo: Repository<Plantation>;
  let owner: User;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TestConfigModule,
        SqliteTestingModule,
        TypeOrmModule.forFeature([User, Plantation]),
      ],
      providers: [PlantationsService],
    }).compile();

    service = moduleRef.get(PlantationsService);
    usersRepo = moduleRef.get(getRepositoryToken(User));
    plantationsRepo = moduleRef.get(getRepositoryToken(Plantation));

    owner = await usersRepo.save(
      usersRepo.create({
        email: 'service-owner@example.com',
        fullName: 'Service Owner',
        passwordHash: 'hash',
        isEmailVerified: true,
      }),
    );
  });

  beforeEach(async () => {
    await plantationsRepo.clear();
  });

  it('creates a plantation for an owner', async () => {
    const plantation = await service.create(owner.id, {
      name: 'Alpha Estate',
      location: 'Buea',
      region: 'South-West',
    });

    expect(plantation.id).toBeDefined();
    expect(plantation.owner.id).toBe(owner.id);
  });

  it('returns plantations for the owner only', async () => {
    await service.create(owner.id, {
      name: 'Alpha Estate',
      location: 'Buea',
      region: 'South-West',
    });
    const results = await service.findAll(owner.id);
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Alpha Estate');
  });

  it('throws when accessing another owners plantation', async () => {
    const plantation = await service.create(owner.id, {
      name: 'Alpha Estate',
      location: 'Buea',
      region: 'South-West',
    });

    await expect(
      service.getOwnedPlantation('non-existent-owner', plantation.id),
    ).rejects.toThrow('Plantation not found');
  });
});
