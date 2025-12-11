import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { Field } from '../../../src/entities/field.entity';
import { Plantation } from '../../../src/entities/plantation.entity';
import { User } from '../../../src/entities/user.entity';
import { PlantationFieldsService } from '../../../src/modules/plantations/plantation-fields.service';
import { PlantationsService } from '../../../src/modules/plantations/plantations.service';
import { TestConfigModule } from '../../utils/test-config.module';
import { SqliteTestingModule } from '../../utils/sqlite-testing.module';

const polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [9.312744, 4.152969],
      [9.314117, 4.152969],
      [9.314117, 4.154026],
      [9.312744, 4.154026],
      [9.312744, 4.152969],
    ],
  ],
};

describe('PlantationFieldsService', () => {
  let service: PlantationFieldsService;
  let plantationsService: PlantationsService;
  let usersRepo: Repository<User>;
  let plantationsRepo: Repository<Plantation>;
  let fieldsRepo: Repository<Field>;
  let owner: User;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TestConfigModule,
        SqliteTestingModule,
        TypeOrmModule.forFeature([User, Plantation, Field]),
      ],
      providers: [PlantationsService, PlantationFieldsService],
    }).compile();

    service = moduleRef.get(PlantationFieldsService);
    plantationsService = moduleRef.get(PlantationsService);
    usersRepo = moduleRef.get(getRepositoryToken(User));
    plantationsRepo = moduleRef.get(getRepositoryToken(Plantation));
    fieldsRepo = moduleRef.get(getRepositoryToken(Field));

    owner = await usersRepo.save(
      usersRepo.create({
        email: 'field-owner@example.com',
        fullName: 'Field Owner',
        passwordHash: 'hash',
        isEmailVerified: true,
      }),
    );
  });

  beforeEach(async () => {
    await fieldsRepo.clear();
    await plantationsRepo.clear();
  });

  it('creates fields up to the allowed limit', async () => {
    const plantation = await plantationsService.create(owner.id, {
      name: 'Delta Estate',
      location: 'Buea',
      region: 'SW',
    });

    for (let i = 0; i < 5; i += 1) {
      const field = await service.createField(owner.id, plantation.id, {
        name: `Field ${i + 1}`,
        boundary: polygon,
      });
      expect(field.areaHectares).toBeDefined();
    }

    await expect(
      service.createField(owner.id, plantation.id, {
        name: 'Field 6',
        boundary: polygon,
      }),
    ).rejects.toThrow('A maximum of 5 fields is allowed per plantation');
  });

  it('lists and fetches fields for plantations', async () => {
    const plantation = await plantationsService.create(owner.id, {
      name: 'Beta Estate',
      location: 'Buea',
      region: 'SW',
    });

    const field = await service.createField(owner.id, plantation.id, {
      name: 'Main Plot',
      soilType: 'Loamy',
      boundary: polygon,
    });

    const fields = await service.getFieldsForPlantation(
      owner.id,
      plantation.id,
    );
    expect(fields).toHaveLength(1);

    const fetched = await service.getField(owner.id, plantation.id, field.id);
    expect(fetched.name).toBe('Main Plot');
  });
});
