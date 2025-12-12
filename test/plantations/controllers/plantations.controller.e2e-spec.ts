import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import type { Repository } from 'typeorm';

import { configureApp } from '../../src/common/utils/app-config.util';
import { User } from '../../src/entities/user.entity';
import { PlantationsModule } from '../../src/modules/plantations/plantations.module';
import { MockJwtAuthGuard, TestRequestContext } from '../utils/mock-jwt.guard';
import { SqliteTestingModule } from '../utils/sqlite-testing.module';
import { TestConfigModule } from '../utils/test-config.module';

describe('PlantationsModule (e2e)', () => {
	let app: INestApplication;
	let usersRepo: Repository<User>;
	let context: TestRequestContext;
	let owner: User;

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [
				TestConfigModule,
				SqliteTestingModule,
				TypeOrmModule.forFeature([User]),
				PlantationsModule,
			],
			providers: [TestRequestContext, MockJwtAuthGuard],
		}).compile();

		context = moduleRef.get(TestRequestContext);
		app = moduleRef.createNestApplication();
		const guard = moduleRef.get(MockJwtAuthGuard);
		app.useGlobalGuards(guard);
		configureApp(app);
		await app.init();

		usersRepo = moduleRef.get<Repository<User>>(getRepositoryToken(User));
		owner = await usersRepo.save(
			usersRepo.create({
				email: 'owner@example.com',
				fullName: 'Owner',
				passwordHash: 'hash',
				isEmailVerified: true,
			})
		);
		context.user = { sub: owner.id, email: owner.email };
	});

	afterAll(async () => {
		await app.close();
	});

	it('creates and retrieves plantations and fields', async () => {
		const server = app.getHttpServer();
		const createPlantationResponse = await request(server)
			.post('/api/v1/plantations')
			.send({
				name: 'Fako Estate',
				location: 'Buea',
				region: 'South-West',
			})
			.expect(201);

		expect(createPlantationResponse.body.data.name).toBe('Fako Estate');

		const plantationId = createPlantationResponse.body.data.id as string;

		const listResponse = await request(server)
			.get('/api/v1/plantations')
			.expect(200);
		expect(Array.isArray(listResponse.body.data)).toBe(true);
		expect(listResponse.body.data).toHaveLength(1);

		await request(server)
			.get(`/api/v1/plantations/${plantationId}`)
			.expect(200)
			.expect((res) => {
				expect(res.body.data.name).toBe('Fako Estate');
			});

		const fieldBoundary = {
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

		const fieldResponse = await request(server)
			.post(`/api/v1/plantations/${plantationId}/fields`)
			.send({
				name: 'Block A',
				soilType: 'Loamy',
				boundary: fieldBoundary,
			})
			.expect(201);

		expect(fieldResponse.body.data.name).toBe('Block A');
		expect(Number(fieldResponse.body.data.areaHectares)).toBeGreaterThan(0);

		const listFieldsResponse = await request(server)
			.get(`/api/v1/plantations/${plantationId}/fields`)
			.expect(200);

		expect(listFieldsResponse.body.data).toHaveLength(1);
		expect(listFieldsResponse.body.data[0].name).toBe('Block A');
	});
});
