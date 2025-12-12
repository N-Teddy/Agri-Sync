import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { CropType } from '../../../src/common/enums/crop-type.enum';
import { Field } from '../../../src/entities/field.entity';
import { FieldActivity } from '../../../src/entities/field-activity.entity';
import { FinancialRecord } from '../../../src/entities/financial-record.entity';
import { Plantation } from '../../../src/entities/plantation.entity';
import { PlantingSeason } from '../../../src/entities/planting-season.entity';
import { User } from '../../../src/entities/user.entity';
import { FieldAccessService } from '../../../src/modules/fields/field-access.service';
import { FinancialRecordsService } from '../../../src/modules/financial/financial-records.service';
import { TestConfigModule } from '../../utils/test-config.module';
import { SqliteTestingModule } from '../../utils/sqlite-testing.module';

describe('FinancialRecordsService', () => {
  let service: FinancialRecordsService;
  let fieldsRepo: Repository<Field>;
  let plantationsRepo: Repository<Plantation>;
  let financialRepo: Repository<FinancialRecord>;
  let usersRepo: Repository<User>;
  let owner: User;
  let field: Field;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TestConfigModule,
        SqliteTestingModule,
        TypeOrmModule.forFeature([
          User,
          Plantation,
          Field,
          PlantingSeason,
          FieldActivity,
          FinancialRecord,
        ]),
      ],
      providers: [FieldAccessService, FinancialRecordsService],
    }).compile();

    service = moduleRef.get(FinancialRecordsService);
    usersRepo = moduleRef.get(getRepositoryToken(User));
    plantationsRepo = moduleRef.get(getRepositoryToken(Plantation));
    fieldsRepo = moduleRef.get(getRepositoryToken(Field));
    financialRepo = moduleRef.get(getRepositoryToken(FinancialRecord));

    owner = await usersRepo.save(
      usersRepo.create({
        email: 'finance-owner@example.com',
        fullName: 'Finance Owner',
        passwordHash: 'hash',
        isEmailVerified: true,
      }),
    );

    const plantation = await plantationsRepo.save(
      plantationsRepo.create({
        owner,
        name: 'Finance Estate',
        location: 'Muyuka',
        region: 'SW',
      }),
    );

    field = await fieldsRepo.save(
      fieldsRepo.create({
        plantation,
        name: 'Finance Field',
      }),
    );
  });

  beforeEach(async () => {
    await financialRepo.clear();
  });

  it('records costs with normalized data', async () => {
    const record = await service.recordCost(owner.id, field.id, {
      amountXaf: 12345.5,
      recordDate: '2025-02-01',
      productName: 'Fertilizer',
      description: 'Top dressing',
    });

    expect(record.amountXaf).toBe('12345.50');

    const summary = await service.getFieldSummary(owner.id, field.id);
    expect(summary.totalCostsXaf).toBe(12345.5);
    expect(summary.totalRevenueXaf).toBe(0);
    expect(summary.profitStatus).toBe('loss');
  });

  it('records revenue and calculates totals', async () => {
    await service.recordCost(owner.id, field.id, {
      amountXaf: 10000,
      recordDate: '2025-01-10',
    });

    const revenue = await service.recordRevenue(owner.id, field.id, {
      cropType: CropType.COFFEE_ARABICA,
      quantityKg: 250,
      pricePerKgXaf: 2000,
      recordDate: '2025-03-01',
      description: 'Main harvest sale',
      buyerName: 'Douala Buyers',
    });

    expect(revenue.amountXaf).toBe('500000.00');

    const summary = await service.getFieldSummary(owner.id, field.id);
    expect(summary.totalCostsXaf).toBe(10000);
    expect(summary.totalRevenueXaf).toBe(500000);
    expect(summary.profitStatus).toBe('profit');
  });
});
