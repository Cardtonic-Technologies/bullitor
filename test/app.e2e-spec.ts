import { AppModule } from '@app/app.module';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
// jest.mock('ioredis', () => require('ioredis-mock/jest'));

describe('Smoke testing endpoints', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/metrics', () => {
    return request(app.getHttpServer())
      .get('/metrics')
      .expect(200)
      .expect('Content-Type', 'text/plain; charset=utf-8; version=0.0.4');
  });

  it('/version', () => {
    return request(app.getHttpServer())
      .get('/version')
      .expect(200)
      .expect('local');
  });

  it('/healthcheck', () => {
    return request(app.getHttpServer())
      .get('/healthcheck')
      .expect(200)
      .expect('OK');
  });
});
