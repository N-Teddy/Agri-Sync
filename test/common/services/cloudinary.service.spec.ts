import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { v2 as cloudinary } from 'cloudinary';

import { CloudinaryService } from '../../../src/common/third-party/cloudinary.service';

afterEach(() => {
	jest.restoreAllMocks();
});

describe('CloudinaryService', () => {
	it('disables upload when config missing', async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({
					isGlobal: true,
					load: [() => ({ cloudinary: {} })],
				}),
			],
			providers: [CloudinaryService],
		}).compile();

		const service = moduleRef.get(CloudinaryService);
		expect(service.isEnabled()).toBe(false);
		await expect(service.uploadImage('/tmp/file.jpg')).rejects.toThrow(
			'Cloudinary is not configured'
		);
	});

	it('uploads image when enabled', async () => {
		const uploadSpy = jest
			.spyOn(cloudinary.uploader, 'upload')
			.mockResolvedValue({
				secure_url: 'https://cdn/image.jpg',
			} as never);

		const moduleRef = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({
					isGlobal: true,
					load: [
						() => ({
							cloudinary: {
								cloudName: 'demo',
								apiKey: 'key',
								apiSecret: 'secret',
							},
						}),
					],
				}),
			],
			providers: [CloudinaryService],
		}).compile();

		const service = moduleRef.get(CloudinaryService);
		expect(service.isEnabled()).toBe(true);
		const result = await service.uploadImage('/tmp/file.jpg', 'avatars');
		expect(result.secure_url).toBe('https://cdn/image.jpg');
		expect(uploadSpy).toHaveBeenCalledWith('/tmp/file.jpg', {
			folder: 'avatars',
			overwrite: true,
		});
	});
});
