import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import type { Repository } from 'typeorm';

import { configureApp } from '../../../src/common/utils/app-config.util';
import { Field } from '../../../src/entities/field.entity';
import { Plantation } from '../../../src/entities/plantation.entity';
import { User } from '../../../src/entities/user.entity';
import { CropManagementModule } from '../../../src/modules/crop-management/crop-management.module';
import {
	MockJwtAuthGuard,
	TestRequestContext,
} from '../../utils/mock-jwt.guard';
import { SqliteTestingModule } from '../../utils/sqlite-testing.module';
import { TestConfigModule } from '../../utils/test-config.module';

describe('CropManagementModule Controllers (e2e)', () => {
	let app: INestApplication;
	let usersRepo: Repository<User>;
	let plantationsRepo: Repository<Plantation>;
	let fieldsRepo: Repository<Field>;
	let context: TestRequestContext;
	let field: Field;

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [
				TestConfigModule,
				SqliteTestingModule,
				TypeOrmModule.forFeature([User, Plantation, Field]),
				CropManagementModule,
			],
			providers: [TestRequestContext, MockJwtAuthGuard],
		}).compile();

		context = moduleRef.get(TestRequestContext);
		app = moduleRef.createNestApplication();
		const guard = moduleRef.get(MockJwtAuthGuard);
		app.useGlobalGuards(guard);
		configureApp(app);
		await app.init();

		usersRepo = moduleRef.get(getRepositoryToken(User));
		plantationsRepo = moduleRef.get(getRepositoryToken(Plantation));
		fieldsRepo = moduleRef.get(getRepositoryToken(Field));

		const owner = await usersRepo.save(
			usersRepo.create({
				email: 'crop-owner@example.com',
				fullName: 'Crop Owner',
				passwordHash: 'hash',
				isEmailVerified: true,
			})
		);
		context.user = { sub: owner.id, email: owner.email };

		const plantation = await plantationsRepo.save(
			plantationsRepo.create({
				owner,
				name: 'Season Estate',
				location: 'Buea',
				region: 'SW',
			})
		);

		field = await fieldsRepo.save(
			fieldsRepo.create({
				plantation,
				name: 'Main Field',
			})
		);
	});

	afterAll(async () => {
		await app.close();
	});

	it('manages planting seasons lifecycle', async () => {
		const server = app.getHttpServer();
		const createRes = await request(server)
			.post(`/api/v1/fields/${field.id}/planting-seasons`)
			.send({
				cropType: 'cocoa',
				plantingDate: '2025-01-01',
			})
			.expect(201);

		expect(createRes.body.data.cropType).toBe('cocoa');
		const seasonId = createRes.body.data.id;

		await request(server)
			.get(`/api/v1/fields/${field.id}/planting-seasons`)
			.expect(200)
			.expect((res) => {
				expect(res.body.data).toHaveLength(1);
			});

		await request(server)
			.get(`/api/v1/fields/${field.id}/planting-seasons/${seasonId}`)
			.expect(200);

		await request(server)
			.patch(
				`/api/v1/fields/${field.id}/planting-seasons/${seasonId}/harvest`
			)
			.send({
				actualHarvestDate: '2025-06-01',
				yieldKg: 1234,
			})
			.expect(200)
			.expect((res) => {
				expect(res.body.data.status).toBe('harvested');
				expect(res.body.data.growthStage).toBe('post_harvest');
			});
	});

	it('logs and lists field activities', async () => {
		const server = app.getHttpServer();
		await request(server)
			.post(`/api/v1/fields/${field.id}/activities`)
			.send({
				activityType: 'planting',
				activityDate: '2025-01-10',
				notes: 'Planted seedlings',
			})
			.expect(201);

		await request(server)
			.get(`/api/v1/fields/${field.id}/activities`)
			.expect(200)
			.expect((res) => {
				expect(res.body.data).toHaveLength(1);
				expect(res.body.data[0].activityType).toBe('planting');
			});
	});
});
