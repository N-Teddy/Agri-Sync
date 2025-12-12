import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { Field } from '../../../src/entities/field.entity';
import { FieldActivity } from '../../../src/entities/field-activity.entity';
import { Plantation } from '../../../src/entities/plantation.entity';
import { PlantingSeason } from '../../../src/entities/planting-season.entity';
import { User } from '../../../src/entities/user.entity';
import { FieldActivitiesService } from '../../../src/modules/crop-management/field-activities.service';
import { PlantingSeasonsService } from '../../../src/modules/crop-management/planting-seasons.service';
import { FieldAccessService } from '../../../src/modules/fields/field-access.service';
import { SqliteTestingModule } from '../../utils/sqlite-testing.module';
import { TestConfigModule } from '../../utils/test-config.module';

describe('FieldActivitiesService', () => {
	let service: FieldActivitiesService;
	let plantingSeasonsService: PlantingSeasonsService;
	let usersRepo: Repository<User>;
	let plantationsRepo: Repository<Plantation>;
	let fieldsRepo: Repository<Field>;
	let activitiesRepo: Repository<FieldActivity>;
	let seasonsRepo: Repository<PlantingSeason>;
	let owner: User;
	let field: Field;
	let seasonId: string;

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
				]),
			],
			providers: [
				FieldAccessService,
				PlantingSeasonsService,
				FieldActivitiesService,
			],
		}).compile();

		service = moduleRef.get(FieldActivitiesService);
		plantingSeasonsService = moduleRef.get(PlantingSeasonsService);
		usersRepo = moduleRef.get(getRepositoryToken(User));
		plantationsRepo = moduleRef.get(getRepositoryToken(Plantation));
		fieldsRepo = moduleRef.get(getRepositoryToken(Field));
		activitiesRepo = moduleRef.get(getRepositoryToken(FieldActivity));
		seasonsRepo = moduleRef.get(getRepositoryToken(PlantingSeason));

		owner = await usersRepo.save(
			usersRepo.create({
				email: 'activity-owner@example.com',
				fullName: 'Activity Owner',
				passwordHash: 'hash',
				isEmailVerified: true,
			})
		);
		const plantation = await plantationsRepo.save(
			plantationsRepo.create({
				owner,
				name: 'Activity Estate',
				location: 'Buea',
				region: 'SW',
			})
		);
		field = await fieldsRepo.save(
			fieldsRepo.create({
				plantation,
				name: 'Activity Field',
			})
		);
	});

	beforeEach(async () => {
		await activitiesRepo.clear();
		await seasonsRepo.clear();
		const season = await plantingSeasonsService.createSeason(
			owner.id,
			field.id,
			{
				cropType: 'cocoa',
				plantingDate: '2025-01-01',
			}
		);
		seasonId = season.id;
	});

	it('logs activities linked to season', async () => {
		const activity = await service.logActivity(owner.id, field.id, {
			activityType: 'planting',
			activityDate: '2025-01-02',
			plantingSeasonId: seasonId,
		});

		expect(activity.id).toBeDefined();
		expect(activity.plantingSeason?.id).toBe(seasonId);
	});

	it('returns activities filtered by planting season', async () => {
		await service.logActivity(owner.id, field.id, {
			activityType: 'planting',
			activityDate: '2025-01-02',
			plantingSeasonId: seasonId,
		});

		const activities = await service.getActivities(owner.id, field.id, {
			plantingSeasonId: seasonId,
		});
		expect(activities).toHaveLength(1);
	});
});
