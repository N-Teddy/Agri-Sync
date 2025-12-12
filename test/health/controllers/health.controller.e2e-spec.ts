import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { configureApp } from '../../../src/common/utils/app-config.util';
import { HealthModule } from '../../../src/modules/health/health.module';

describe('HealthController (e2e)', () => {
	let app: INestApplication;

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [HealthModule],
		}).compile();

		app = moduleRef.createNestApplication();
		configureApp(app);
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	it('returns health status', async () => {
		const server = app.getHttpServer();
		const response = await request(server)
			.get('/api/v1/health')
			.expect(200);
		expect(response.body.status).toBe('success');
		expect(response.body.message).toBe('Application healthy');
	});
});
