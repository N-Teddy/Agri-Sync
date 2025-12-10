import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { AppConfiguration } from 'src/config/configuration';

@Injectable()
export class LocalStorageService {
  private readonly uploadsDir: string;

  constructor(private readonly configService: ConfigService<AppConfiguration>) {
    const dir =
      this.configService.get('storage')?.uploadsDir ??
      join(process.cwd(), 'uploads');

    this.uploadsDir = dir.startsWith('/')
      ? dir
      : join(process.cwd(), dir);

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
