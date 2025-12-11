import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { Field } from '../../../src/entities/field.entity';
import { Plantation } from '../../../src/entities/plantation.entity';
import { PlantingSeason } from '../../../src/entities/planting-season.entity';
import { User } from '../../../src/entities/user.entity';
import { FieldAccessService } from '../../../src/modules/fields/field-access.service';
import { PlantingSeasonsService } from '../../../src/modules/crop-management/planting-seasons.service';
import { TestConfigModule } from '../../utils/test-config.module';
import { SqliteTestingModule } from '../../utils/sqlite-testing.module';

describe('PlantingSeasonsService', () => {
  let service: PlantingSeasonsService;
  let fieldsRepo: Repository<Field>;
  let plantationsRepo: Repository<Plantation>;
  let seasonsRepo: Repository<PlantingSeason>;
  let usersRepo: Repository<User>;
  let owner: User;
  let field: Field;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TestConfigModule,
        SqliteTestingModule,
        TypeOrmModule.forFeature([User, Plantation, Field, PlantingSeason]),
      ],
      providers: [FieldAccessService, PlantingSeasonsService],
    }).compile();

    service = moduleRef.get(PlantingSeasonsService);
    usersRepo = moduleRef.get(getRepositoryToken(User));
    plantationsRepo = moduleRef.get(getRepositoryToken(Plantation));
    fieldsRepo = moduleRef.get(getRepositoryToken(Field));
    seasonsRepo = moduleRef.get(getRepositoryToken(PlantingSeason));

    owner = await usersRepo.save(
      usersRepo.create({
        email: 'season-owner@example.com',
        fullName: 'Season Owner',
        passwordHash: 'hash',
        isEmailVerified: true,
      }),
    );

    const plantation = await plantationsRepo.save(
      plantationsRepo.create({
        owner,
        name: 'Season Estate',
        location: 'Buea',
        region: 'SW',
      }),
    );

    field = await fieldsRepo.save(
      fieldsRepo.create({
        plantation,
        name: 'Season Field',
      }),
    );
  });

  beforeEach(async () => {
    await seasonsRepo.clear();
  });

  it('creates a planting season and enforces single active season', async () => {
    const created = await service.createSeason(owner.id, field.id, {
      cropType: 'cocoa',
      plantingDate: '2025-01-01',
    });

    expect(created.cropType).toBe('cocoa');
    await expect(
      service.createSeason(owner.id, field.id, {
        cropType: 'maize',
        plantingDate: '2025-02-01',
      }),
    ).rejects.toThrow('Field already has an active or planned season');
  });

  it('marks harvest and updates growth stage', async () => {
    const created = await service.createSeason(owner.id, field.id, {
      cropType: 'cocoa',
      plantingDate: '2025-01-01',
    });

    const harvested = await service.markHarvestComplete(
      owner.id,
      field.id,
      created.id,
      {
        actualHarvestDate: '2025-06-01',
        yieldKg: 123,
      },
    );

    expect(harvested.status).toBe('harvested');
    expect(harvested.growthStage).toBe('post_harvest');
  });
});
