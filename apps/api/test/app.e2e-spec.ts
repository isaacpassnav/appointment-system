import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect((res) => {
        const body: unknown = res.body;
        expect(body).toEqual(
          expect.objectContaining({
            status: 'ok',
            service: 'appointment-api',
          }),
        );

        if (
          typeof body !== 'object' ||
          body === null ||
          !('timestamp' in body)
        ) {
          throw new Error(
            'Health response does not contain a timestamp field.',
          );
        }

        const timestamp = (body as { timestamp: unknown }).timestamp;
        expect(typeof timestamp).toBe('string');

        if (typeof timestamp !== 'string') {
          throw new Error('Health timestamp must be a string.');
        }

        expect(new Date(timestamp).toISOString()).toBe(timestamp);
      });
  });
});
