import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

import { AppConfiguration } from '../../config/configuration';
import { CloudinaryService } from '../third-party/cloudinary.service';
import { ImageType } from '../enums/image-type.enum';
import { LocalStorageService } from './local-storage.service';

export interface UploadedImage {
	url: string;
	publicId?: string;
	width: number;
	height: number;
	format: string;
	size: number;
}

@Injectable()
export class ImageUploadService {
	private readonly logger = new Logger(ImageUploadService.name);
	private readonly useCloudinary: boolean;

	constructor(
		private readonly cloudinaryService: CloudinaryService,
		private readonly localStorageService: LocalStorageService,
		private readonly configService: ConfigService<AppConfiguration>
	) {
		this.useCloudinary = this.cloudinaryService.isEnabled();
		this.logger.log(
			`Image upload mode: ${this.useCloudinary ? 'Cloudinary' : 'Local Storage'}`
		);
	}

	async uploadImage(
		file: Express.Multer.File,
		imageType: ImageType,
		options?: {
			maxWidth?: number;
			maxHeight?: number;
			quality?: number;
		}
	): Promise<UploadedImage> {
		// Compress and resize image
		const processedImage = await this.processImage(file.buffer, options);

		// Generate unique filename
		const filename = `${uuidv4()}.${processedImage.format}`;

		if (this.useCloudinary) {
			return this.uploadToCloudinary(
				processedImage.buffer,
				filename,
				imageType,
				processedImage
			);
		} else {
			return this.uploadToLocal(
				processedImage.buffer,
				filename,
				imageType,
				processedImage
			);
		}
	}

	private async processImage(
		buffer: Buffer,
		options?: {
			maxWidth?: number;
			maxHeight?: number;
			quality?: number;
		}
	): Promise<{
		buffer: Buffer;
		width: number;
		height: number;
		format: string;
		size: number;
	}> {
		const maxWidth = options?.maxWidth || 1920;
		const maxHeight = options?.maxHeight || 1080;
		const quality = options?.quality || 80;

		let image = sharp(buffer);

		// Get metadata
		const metadata = await image.metadata();

		// Resize if needed
		if (
			metadata.width &&
			metadata.height &&
			(metadata.width > maxWidth || metadata.height > maxHeight)
		) {
			image = image.resize(maxWidth, maxHeight, {
				fit: 'inside',
				withoutEnlargement: true,
			});
		}

		// Convert to JPEG and compress
		const processedBuffer = await image
			.jpeg({ quality, progressive: true })
			.toBuffer();

		const processedMetadata = await sharp(processedBuffer).metadata();

		return {
			buffer: processedBuffer,
			width: processedMetadata.width || 0,
			height: processedMetadata.height || 0,
			format: 'jpeg',
			size: processedBuffer.length,
		};
	}

	private async uploadToCloudinary(
		buffer: Buffer,
		filename: string,
		imageType: ImageType,
		metadata: {
			width: number;
			height: number;
			format: string;
			size: number;
		}
	): Promise<UploadedImage> {
		// Save to temp file first (Cloudinary requires file path)
		const tempPath = await this.localStorageService.saveFile(
			buffer,
			`temp_${filename}`,
			ImageType.ACTIVITY
		);

		try {
			const result = await this.cloudinaryService.uploadImage(
				this.localStorageService.getFilePath(tempPath),
				imageType
			);

			// Clean up temp file
			const fs = await import('fs/promises');
			await fs.unlink(this.localStorageService.getFilePath(tempPath));

			return {
				url: result.secure_url,
				publicId: result.public_id,
				width: metadata.width,
				height: metadata.height,
				format: metadata.format,
				size: metadata.size,
			};
		} catch (error) {
			// Clean up temp file on error
			try {
				const fs = await import('fs/promises');
				await fs.unlink(this.localStorageService.getFilePath(tempPath));
			} catch {
				// Ignore cleanup errors
			}
			throw error;
		}
	}

	private async uploadToLocal(
		buffer: Buffer,
		filename: string,
		imageType: ImageType,
		metadata: {
			width: number;
			height: number;
			format: string;
			size: number;
		}
	): Promise<UploadedImage> {
		const relativePath = await this.localStorageService.saveFile(
			buffer,
			filename,
			imageType
		);

		// Generate URL for local files
		const appConfig =
			this.configService.get<AppConfiguration['app']>('app');
		const baseUrl = appConfig?.webUrl || 'http://localhost:3000';
		const url = `${baseUrl}/uploads/${relativePath}`;

		return {
			url,
			width: metadata.width,
			height: metadata.height,
			format: metadata.format,
			size: metadata.size,
		};
	}

	async deleteImage(publicIdOrPath: string): Promise<void> {
		if (this.useCloudinary) {
			// Delete from Cloudinary
			const cloudinary = await import('cloudinary');
			await cloudinary.v2.uploader.destroy(publicIdOrPath);
		} else {
			// Delete from local storage
			const fs = await import('fs/promises');
			const fullPath =
				this.localStorageService.getFilePath(publicIdOrPath);
			await fs.unlink(fullPath);
		}
	}
}
