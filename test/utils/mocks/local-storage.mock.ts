import { Injectable } from '@nestjs/common';

@Injectable()
export class MockLocalStorageService {
	private files: Record<string, Buffer> = {};

	async saveFile(buffer: Buffer, filename: string): Promise<string> {
		this.files[filename] = buffer;
		return `/tmp/${filename}`;
	}

	getFile(filename: string): Buffer | undefined {
		return this.files[filename];
	}
}
