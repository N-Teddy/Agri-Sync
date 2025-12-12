import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import type { Express } from 'express';
import type { Repository } from 'typeorm';

import { LocalStorageService } from '../../../src/common/services/local-storage.service';
import { CloudinaryService } from '../../../src/common/third-party/cloudinary.service';
import { GoogleAuthService } from '../../../src/common/third-party/google-auth.service';
import { User } from '../../../src/entities/user.entity';
import { AuthService } from '../../../src/modules/auth/auth.service';
import { EmailQueueService } from '../../../src/modules/email/email-queue.service';
import { UsersService } from '../../../src/modules/users/users.service';
import { MockCloudinaryService } from '../../utils/mocks/cloudinary.mock';
import { MockEmailQueueService } from '../../utils/mocks/email-queue.mock';
import { MockGoogleAuthService } from '../../utils/mocks/google-auth.mock';
import { MockLocalStorageService } from '../../utils/mocks/local-storage.mock';
import { SqliteTestingModule } from '../../utils/sqlite-testing.module';
import { TestConfigModule } from '../../utils/test-config.module';

describe('AuthService', () => {
	let service: AuthService;
	let usersRepo: Repository<User>;
	let emailQueue: MockEmailQueueService;
	let googleAuth: MockGoogleAuthService;
	let localStorage: MockLocalStorageService;

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
			providers: [
				AuthService,
				UsersService,
				{ provide: EmailQueueService, useClass: MockEmailQueueService },
				{ provide: GoogleAuthService, useClass: MockGoogleAuthService },
				{ provide: CloudinaryService, useClass: MockCloudinaryService },
				{
					provide: LocalStorageService,
					useClass: MockLocalStorageService,
				},
			],
		}).compile();

		service = moduleRef.get(AuthService);
		usersRepo = moduleRef.get(getRepositoryToken(User));
		emailQueue = moduleRef.get(EmailQueueService);
		googleAuth = moduleRef.get(GoogleAuthService);
		localStorage = moduleRef.get(LocalStorageService);
	});

	beforeEach(async () => {
		await usersRepo.clear();
		emailQueue.jobs = [];
	});

	const createUser = async () => {
		const response = await service.register({
			email: 'existing@example.com',
			password: 'Secret123!',
			fullName: 'Existing User',
		});
		const userId = response.user['id'] as string;
		return { ...response, userId };
	};

	it('registers a user and queues verification email', async () => {
		const result = await service.register({
			email: 'newuser@example.com',
			password: 'Secret123!',
			fullName: 'New User',
		});

		expect(result.accessToken).toBeDefined();
		expect(emailQueue.jobs).toHaveLength(1);
		expect(emailQueue.jobs[0].to).toBe('newuser@example.com');
	});

	it('prevents duplicate registrations', async () => {
		await createUser();
		await expect(createUser()).rejects.toThrow('Email already registered');
	});

	it('logs in with correct credentials', async () => {
		await createUser();
		const login = await service.login({
			email: 'existing@example.com',
			password: 'Secret123!',
		});
		expect(login.accessToken).toBeDefined();
	});

	it('refreshes tokens', async () => {
		const { refreshToken, userId } = await createUser();
		const refreshed = await service.refreshTokens({ refreshToken });
		expect(refreshed.user).toBeDefined();
		expect(refreshed.user?.['id']).toBe(userId);
	});

	it('logs out and clears refresh token', async () => {
		const { userId } = await createUser();
		await service.logout(userId);
		const updated = await usersRepo.findOne({ where: { id: userId } });
		expect(updated?.refreshTokenHash).toBeNull();
	});

	it('verifies email tokens', async () => {
		await createUser();
		const user = await usersRepo.findOneByOrFail({
			email: 'existing@example.com',
		});
		await service.verifyEmail({ token: user.emailVerificationToken! });
		const updated = await usersRepo.findOneByOrFail({ id: user.id });
		expect(updated.isEmailVerified).toBe(true);
	});

	it('updates profile', async () => {
		const { userId } = await createUser();
		const updated = await service.updateProfile(userId, {
			fullName: 'Updated Name',
		});
		expect(updated.fullName).toBe('Updated Name');
	});

	it('uploads avatar using local storage in test env', async () => {
		const { userId } = await createUser();
		const file = {
			buffer: Buffer.from('avatar'),
			originalname: 'avatar.png',
		} as Express.Multer.File;

		const result = await service.uploadAvatar(userId, file);
		expect(result.avatarUrl).toContain('/tmp/');
		expect(
			localStorage.getFile(result.avatarUrl.split('/').pop() ?? '')
		).toBeDefined();
	});

	it('handles google auth for new profile', async () => {
		googleAuth.setProfile('token-123', {
			email: 'google@example.com',
			emailVerified: true,
			name: 'Google User',
			picture: 'https://example.com/avatar.png',
			sub: 'google-sub',
		});

		const result = await service.googleAuth({
			idToken: 'token-123',
			rememberMe: false,
		});
		expect(result.user?.['email']).toBe('google@example.com');
	});

	it('throws on invalid refresh token', async () => {
		await expect(
			service.refreshTokens({ refreshToken: 'invalid' })
		).rejects.toThrow('Invalid refresh token');
	});
});
