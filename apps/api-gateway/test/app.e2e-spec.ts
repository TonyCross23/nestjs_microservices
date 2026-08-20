import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { of } from 'rxjs';
import request from 'supertest';
import { ApiGatewayController } from './../src/api-gateway.controller';

describe('ApiGatewayController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ApiGatewayController],
      providers: [
        { provide: 'AUTH_SERVICE', useValue: { send: jest.fn(() => of({})) } },
        { provide: 'PRODUCT_SERVICE', useValue: { send: jest.fn(() => of({})) } },
        { provide: 'ORDER_SERVICE', useValue: { send: jest.fn(() => of({})) } },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'user@example.com', password: 'secret1', name: 'User' })
      .expect(201)
      .expect({});
  });
});
