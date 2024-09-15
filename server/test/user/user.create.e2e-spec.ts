import { Test } from '@nestjs/testing';
import { Connection, Types } from 'mongoose';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
//import { Logger } from '@nestjs/common';
import { DatabaseService } from 'src/contexts/shared/database/infraestructure/database.service';

import { UserPersonDto } from 'src/contexts/user/infraestructure/controller/dto/user.person.DTO';
import { userSub } from '../user.stub';

let dbConnection: Connection;
let httpServer: any;
let app: any;
beforeEach(async () => {
  if (dbConnection) {
    // Limpiar la base de datos si es necesario
    await dbConnection.collection('users').deleteMany({});
  }
});

describe('Create a Personal account', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    //app.useLogger(new Logger());
    await app.init();

    dbConnection = moduleRef
      .get<DatabaseService>(DatabaseService)
      .getDBHandle();
    httpServer = app.getHttpServer();
  });

  it('should create a personal account', async () => {
    const userPersonDto: UserPersonDto = {
      clerkId: userSub().clerkId,
      email: userSub().email,
      username: userSub().username,
      description: userSub().description,
      profilePhotoUrl: userSub().profilePhotoUrl,
      countryRegion: userSub().countryRegion,
      isActive: userSub().isActive,
      contact: userSub().contact,
      createdTime: userSub().createdTime,
      name: userSub().name,
      lastName: userSub().lastName,
      gender: userSub().gender,
      birthDate: userSub().birthDate,
    };

    const response = await request(httpServer)
      .post('/user/personal')
      //.set('Authorization', `bearer ${token}`)
      .send(userPersonDto as UserPersonDto);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      clerkId: userPersonDto.clerkId,
      email: userPersonDto.email,
      username: userPersonDto.username,
      description: userPersonDto.description,
      profilePhotoUrl: userPersonDto.profilePhotoUrl,
      countryRegion: userPersonDto.countryRegion,
      isActive: userPersonDto.isActive,
      createdTime: userPersonDto.createdTime,
      name: userPersonDto.name,
      lastName: userPersonDto.lastName,
      gender: userPersonDto.gender,
      birthDate: userPersonDto.birthDate,
    });
    expect(response.body).toHaveProperty('_id');
    expect(Types.ObjectId.isValid(response.body.contact)).toBe(true);
  });
});
