import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync, promises as fs } from 'fs';
import { join } from 'path';
import { AppConfiguration } from '../../config/configuration';

@Injectable()
export class LocalStorageService {
  private readonly uploadsDir: string;

  constructor(private readonly configService: ConfigService<AppConfiguration>) {
    const storage =
      this.configService.get<AppConfiguration['storage']>('storage');
    const fallbackDir = join(process.cwd(), 'uploads');
    const dir = storage?.uploadsDir ?? fallbackDir;

    this.uploadsDir = dir.startsWith('/') ? dir : join(process.cwd(), dir);

    if (!existsSync(this.uploadsDir)) {
      mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async saveFile(buffer: Buffer, filename: string): Promise<string> {
    const filePath = join(this.uploadsDir, filename);
    await fs.writeFile(filePath, buffer);
    return filePath;
  }
}
