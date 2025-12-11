import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { promises as fs } from 'fs';

import { LocalStorageService } from '../../../src/common/services/local-storage.service';

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              storage: {
                uploadsDir: 'uploads-test',
              },
            }),
          ],
        }),
      ],
      providers: [LocalStorageService],
    }).compile();

    service = moduleRef.get(LocalStorageService);
  });

  it('saves a file to disk', async () => {
    const path = await service.saveFile(Buffer.from('content'), 'test.txt');
    const saved = await fs.readFile(path, 'utf8');
    expect(saved).toBe('content');
  });
});
