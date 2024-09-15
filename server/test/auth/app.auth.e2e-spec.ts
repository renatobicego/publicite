import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';

let httpServer: any;
let app: any;

describe('Create a Personal account', () => {
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    //app.useLogger(new Logger());
    await app.init();

    httpServer = app.getHttpServer();
  });

  it('should error if user are not authorized', async () => {
    const response = await request(httpServer).get('/user/auth');
    console.log(response.body);
    expect(response.status).toBe(403);
  });
});
