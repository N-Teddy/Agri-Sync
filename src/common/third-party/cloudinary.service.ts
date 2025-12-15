import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';

import { AppConfiguration } from '../../config/configuration';
import { ImageType } from '../enums/image-type.enum';

@Injectable()
export class CloudinaryService {
	private readonly enabled: boolean;

	constructor(
		private readonly configService: ConfigService<AppConfiguration>
	) {
		const cloudConfig =
			this.configService.get<AppConfiguration['cloudinary']>(
				'cloudinary'
			);
		this.enabled = Boolean(
			cloudConfig?.cloudName &&
				cloudConfig?.apiKey &&
				cloudConfig?.apiSecret
		);

		if (this.enabled) {
			cloudinary.config({
				cloud_name: cloudConfig?.cloudName,
				api_key: cloudConfig?.apiKey,
				api_secret: cloudConfig?.apiSecret,
				secure: true,
			});
		}
	}

	isEnabled(): boolean {
		return this.enabled;
	}

	async uploadImage(
		filePath: string,
		imageType: ImageType = ImageType.ACTIVITY
	): Promise<UploadApiResponse> {
		if (!this.enabled) {
			throw new Error('Cloudinary is not configured');
		}

		// Create folder path: AgriSync/{imageType}
		const folder = `AgriSync/${imageType}`;

		return cloudinary.uploader.upload(filePath, {
			folder,
			overwrite: true,
		});
	}
}
