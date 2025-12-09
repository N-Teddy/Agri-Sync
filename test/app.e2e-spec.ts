import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request, { Response } from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/common/utils/app-config.util';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await configureApp(app);
    await app.init();
  });

  it('/api/v1/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect(({ body }: Response) => {
        expect(body.status).toBe('success');
        expect(body.message).toBe('Application healthy');
        expect(body.data.status).toBe('ok');
        expect(body.data.info.memory_heap.status).toBe('up');
        expect(body.data.info.memory_rss.status).toBe('up');
      });
  });
});
