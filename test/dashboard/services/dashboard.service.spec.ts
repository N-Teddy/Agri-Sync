import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { ActivityType } from '../../../src/common/enums/activity-type.enum';
import { AlertSeverity } from '../../../src/common/enums/alert-severity.enum';
import { AlertType } from '../../../src/common/enums/alert-type.enum';
import { CropType } from '../../../src/common/enums/crop-type.enum';
import { Alert } from '../../../src/entities/alert.entity';
import { Field } from '../../../src/entities/field.entity';
import { FieldActivity } from '../../../src/entities/field-activity.entity';
import { FinancialRecord } from '../../../src/entities/financial-record.entity';
import { Plantation } from '../../../src/entities/plantation.entity';
import { PlantingSeason } from '../../../src/entities/planting-season.entity';
import { User } from '../../../src/entities/user.entity';
import { WeatherData } from '../../../src/entities/weather-data.entity';
import { FieldAccessService } from '../../../src/modules/fields/field-access.service';
import { FinancialRecordsService } from '../../../src/modules/financial/financial-records.service';
import { DashboardService } from '../../../src/modules/dashboard/dashboard.service';
import { TestConfigModule } from '../../utils/test-config.module';
import { SqliteTestingModule } from '../../utils/sqlite-testing.module';

describe('DashboardService', () => {
  let dashboardService: DashboardService;
  let financialService: FinancialRecordsService;
  let fieldsRepo: Repository<Field>;
  let plantationsRepo: Repository<Plantation>;
  let usersRepo: Repository<User>;
  let activitiesRepo: Repository<FieldActivity>;
  let weatherRepo: Repository<WeatherData>;
  let alertsRepo: Repository<Alert>;
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
          WeatherData,
          Alert,
        ]),
      ],
      providers: [
        FieldAccessService,
        FinancialRecordsService,
        DashboardService,
      ],
    }).compile();

    dashboardService = moduleRef.get(DashboardService);
    financialService = moduleRef.get(FinancialRecordsService);
    usersRepo = moduleRef.get(getRepositoryToken(User));
    plantationsRepo = moduleRef.get(getRepositoryToken(Plantation));
    fieldsRepo = moduleRef.get(getRepositoryToken(Field));
    activitiesRepo = moduleRef.get(getRepositoryToken(FieldActivity));
    weatherRepo = moduleRef.get(getRepositoryToken(WeatherData));
    alertsRepo = moduleRef.get(getRepositoryToken(Alert));

    owner = await usersRepo.save(
      usersRepo.create({
        email: 'dashboard-owner@example.com',
        fullName: 'Dashboard Owner',
        passwordHash: 'hash',
        isEmailVerified: true,
      }),
    );

    const plantation = await plantationsRepo.save(
      plantationsRepo.create({
        owner,
        name: 'Dashboard Estate',
        location: 'Limbe',
        region: 'SW',
      }),
    );

    field = await fieldsRepo.save(
      fieldsRepo.create({
        plantation,
        name: 'Dashboard Field',
      }),
    );
  });

  beforeEach(async () => {
    await Promise.all([
      activitiesRepo.clear(),
      weatherRepo.clear(),
      alertsRepo.clear(),
    ]);
  });

  it('returns aggregated summary data for dashboard', async () => {
    await financialService.recordCost(owner.id, field.id, {
      amountXaf: 5000,
      recordDate: '2025-01-05',
    });
    await financialService.recordRevenue(owner.id, field.id, {
      cropType: CropType.COFFEE_ROBUSTA,
      quantityKg: 200,
      pricePerKgXaf: 1800,
      recordDate: '2025-02-10',
    });

    await activitiesRepo.save(
      activitiesRepo.create({
        field,
        activityType: ActivityType.PLANTING,
        activityDate: '2025-01-01',
      }),
    );

    await weatherRepo.save(
      weatherRepo.create({
        field,
        recordedAt: new Date('2025-01-15T08:00:00Z'),
        temperatureC: '28.50',
        humidityPercent: '75.00',
        rainfallMm: '12.00',
        isForecast: false,
        source: 'test-source',
      }),
    );

    await alertsRepo.save(
      alertsRepo.create({
        field,
        title: 'Heavy Rain Warning',
        alertType: AlertType.GENERAL_WEATHER,
        severity: AlertSeverity.HIGH,
        message: '50mm rain expected',
        triggeredAt: new Date('2025-01-20T06:00:00Z'),
      }),
    );

    const summary = await dashboardService.getSummary(owner.id);
    expect(summary.fields).toHaveLength(1);
    expect(summary.weatherOverview[0].temperatureC).toBe(28.5);
    expect(summary.recentActivities).toHaveLength(1);
    expect(summary.activeAlerts).toHaveLength(1);
    expect(summary.financialSnapshot.totals.costs).toBe(5000);
    expect(summary.financialSnapshot.totals.revenue).toBe(360000);
    expect(summary.financialSnapshot.perField[0].profitStatus).toBe('profit');
  });
});
