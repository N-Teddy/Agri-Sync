import { Injectable } from '@nestjs/common';

@Injectable()
export class MockCloudinaryService {
	private uploads: Array<{ filePath: string; folder: string }> = [];

	isEnabled(): boolean {
		return true;
	}

	async uploadImage(filePath: string, folder = 'Agri Sync') {
		this.uploads.push({ filePath, folder });
		return {
			secure_url: `https://cdn.example.com/${folder}/${filePath
				.split('/')
				.pop()}`,
		};
	}

	getUploadedFiles() {
		return this.uploads;
	}
}
