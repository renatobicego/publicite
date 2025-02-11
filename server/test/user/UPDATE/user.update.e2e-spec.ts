import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import * as request from 'supertest';

import { AppModule } from 'src/app.module';
import { DatabaseService } from 'src/contexts/module_shared/database/infrastructure/database.service';
import { UserType } from 'src/contexts/module_user/user/domain/entity/enum/user.enums';
import { userSub } from '../../model/user.stub';

let dbConnection: Connection;
let httpServer: any;
let app: any;
const token = process.env.TEST_TOKEN as string;

describe('Update an Account', () => {
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    dbConnection = moduleRef.get<DatabaseService>(DatabaseService).getDBHandle();
    httpServer = app.getHttpServer();


    await dbConnection.collection('users').deleteMany({});
    await dbConnection.collection('users').insertOne({
      ...userSub(),
      userType: UserType.Person,
    });
  });

  afterAll(async () => {
    await dbConnection.close();
    await app.close();
  });

  const updateUser = async (updateData: Record<string, any>) => {
    const response = await request(httpServer)
      .put(`/user/personal/${userSub().username}`)
      .set('Authorization', `bearer ${token}`)
      .send(updateData);

    const userUpdated = await dbConnection.collection('users').findOne({ username: userSub().username });
    return { response, userUpdated };
  };

  it('updates a personal account - birthDate', async () => {
    const { response, userUpdated } = await updateUser({
      birthDate: '2000-01-01',
      gender: "F",
      countryRegion: "Argentina",
      description: "ASD"
    });

    expect(response.status).toBe(200);
    expect(userUpdated).toBeTruthy();
    expect(userUpdated?.birthDate).toBe('2000-01-01');
  });


});
