import type { INestApplication } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import type { Repository } from 'typeorm';

import { JwtAuthGuard as AppJwtAuthGuard } from '../../../src/common/guards/jwt-auth.guard';
import { LocalStorageService } from '../../../src/common/services/local-storage.service';
import { CloudinaryService } from '../../../src/common/third-party/cloudinary.service';
import { GoogleAuthService } from '../../../src/common/third-party/google-auth.service';
import { configureApp } from '../../../src/common/utils/app-config.util';
import { User } from '../../../src/entities/user.entity';
import { AuthController } from '../../../src/modules/auth/auth.controller';
import { AuthService } from '../../../src/modules/auth/auth.service';
import { EmailQueueService } from '../../../src/modules/email/email-queue.service';
import { UsersService } from '../../../src/modules/users/users.service';
import {
	MockJwtAuthGuard,
	TestRequestContext,
} from '../../utils/mock-jwt.guard';
import { MockCloudinaryService } from '../../utils/mocks/cloudinary.mock';
import { MockEmailQueueService } from '../../utils/mocks/email-queue.mock';
import { MockGoogleAuthService } from '../../utils/mocks/google-auth.mock';
import { MockLocalStorageService } from '../../utils/mocks/local-storage.mock';
import { SqliteTestingModule } from '../../utils/sqlite-testing.module';
import { TestConfigModule } from '../../utils/test-config.module';

describe('AuthController (e2e)', () => {
	let app: INestApplication;
	let usersRepo: Repository<User>;
	let context: TestRequestContext;
	let googleAuth: MockGoogleAuthService;

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [
				TestConfigModule,
				SqliteTestingModule,
				TypeOrmModule.forFeature([User]),
				JwtModule.register({
					secret: 'test-secret',
					signOptions: { expiresIn: '1h' },
				}),
			],
			controllers: [AuthController],
			providers: [
				AuthService,
				UsersService,
				TestRequestContext,
				{ provide: EmailQueueService, useClass: MockEmailQueueService },
				{ provide: GoogleAuthService, useClass: MockGoogleAuthService },
				{ provide: CloudinaryService, useClass: MockCloudinaryService },
				{
					provide: LocalStorageService,
					useClass: MockLocalStorageService,
				},
				{ provide: AppJwtAuthGuard, useClass: MockJwtAuthGuard },
			],
		}).compile();

		context = moduleRef.get(TestRequestContext);
		googleAuth = moduleRef.get(GoogleAuthService);
		usersRepo = moduleRef.get(getRepositoryToken(User));

		app = moduleRef.createNestApplication();
		configureApp(app);
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await usersRepo.clear();
	});

	it('registers, logs in, and refreshes tokens', async () => {
		const server = app.getHttpServer();
		const registerRes = await request(server)
			.post('/api/v1/auth/register')
			.send({
				email: 'controller@example.com',
				password: 'Secret123!',
				fullName: 'Controller User',
			})
			.expect(201);

		expect(registerRes.body.data.accessToken).toBeDefined();

		const loginRes = await request(server)
			.post('/api/v1/auth/login')
			.send({ email: 'controller@example.com', password: 'Secret123!' })
			.expect(201);

		expect(loginRes.body.data.accessToken).toBeDefined();

		await request(server)
			.post('/api/v1/auth/refresh')
			.send({ refreshToken: loginRes.body.data.refreshToken })
			.expect(201);
	});

	it('exposes authenticated profile endpoints', async () => {
		const server = app.getHttpServer();
		const registerRes = await request(server)
			.post('/api/v1/auth/register')
			.send({
				email: 'profile@example.com',
				password: 'Secret123!',
				fullName: 'Profile User',
			})
			.expect(201);

		const userId = registerRes.body.data.user.id as string;
		context.user = { sub: userId, email: 'profile@example.com' };

		await request(server).get('/api/v1/auth/me').expect(200);

		await request(server)
			.patch('/api/v1/auth/profile')
			.send({ fullName: 'Updated' })
			.expect(200);

		await request(server).post('/api/v1/auth/logout').expect(201);
	});

	it('uploads avatar via controller', async () => {
		const server = app.getHttpServer();
		const registerRes = await request(server)
			.post('/api/v1/auth/register')
			.send({
				email: 'avatar@example.com',
				password: 'Secret123!',
				fullName: 'Avatar User',
			})
			.expect(201);

		const userId = registerRes.body.data.user.id as string;
		context.user = { sub: userId, email: 'avatar@example.com' };

		await request(server)
			.post('/api/v1/auth/profile/avatar')
			.attach('avatar', Buffer.from('data'), 'avatar.png')
			.expect(201)
			.expect((res) => {
				expect(res.body.data.avatarUrl).toContain('/tmp/');
			});
	});

	it('handles Google auth endpoint', async () => {
		const server = app.getHttpServer();
		googleAuth.setProfile('controller-token', {
			email: 'google-controller@example.com',
			emailVerified: true,
			name: 'Google Controller',
			picture: 'https://example.com/avatar.png',
			sub: 'google-sub',
		});

		await request(server)
			.post('/api/v1/auth/google')
			.send({ idToken: 'controller-token' })
			.expect(201)
			.expect((res) => {
				expect(res.body.data.user.email).toBe(
					'google-controller@example.com'
				);
			});
	});
});
