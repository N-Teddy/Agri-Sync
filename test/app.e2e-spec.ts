import type { INestApplication } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { Response } from 'supertest';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { configureApp } from '../src/common/utils/app-config.util';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  it('/api/v1/health (GET)', () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    return request(server)
      .get('/api/v1/health')
      .expect(200)
      .expect((res: Response) => {
        const body = res.body as {
          status: string;
          message: string;
          data: {
            status: string;
            info: {
              memory_heap: { status: string };
              memory_rss: { status: string };
            };
          };
        };
        expect(body.status).toBe('success');
        expect(body.message).toBe('Application healthy');
        expect(body.data.status).toBe('ok');
        expect(body.data.info.memory_heap.status).toBe('up');
        expect(body.data.info.memory_rss.status).toBe('up');
      });
  });
});
