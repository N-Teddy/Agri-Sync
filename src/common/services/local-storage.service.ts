import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync, promises as fs } from 'fs';
import { join } from 'path';

import { AppConfiguration } from '../../config/configuration';
import { ImageType } from '../enums/image-type.enum';

@Injectable()
export class LocalStorageService {
	private readonly uploadsDir: string;

	constructor(
		private readonly configService: ConfigService<AppConfiguration>
	) {
		const storage =
			this.configService.get<AppConfiguration['storage']>('storage');
		const fallbackDir = join(process.cwd(), 'uploads');
		const dir = storage?.uploadsDir ?? fallbackDir;

		this.uploadsDir = dir.startsWith('/') ? dir : join(process.cwd(), dir);

		if (!existsSync(this.uploadsDir)) {
			mkdirSync(this.uploadsDir, { recursive: true });
		}
	}

	async saveFile(
		buffer: Buffer,
		filename: string,
		imageType?: ImageType
	): Promise<string> {
		// Create subfolder if imageType is provided
		const targetDir = imageType
			? join(this.uploadsDir, imageType)
			: this.uploadsDir;

		// Ensure the target directory exists
		if (!existsSync(targetDir)) {
			mkdirSync(targetDir, { recursive: true });
		}

		const filePath = join(targetDir, filename);
		await fs.writeFile(filePath, buffer);

		// Return relative path from uploads directory
		return imageType ? join(imageType, filename) : filename;
	}

	getFilePath(relativePath: string): string {
		return join(this.uploadsDir, relativePath);
	}
}
