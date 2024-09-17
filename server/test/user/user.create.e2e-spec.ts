import { Test } from '@nestjs/testing';
import { Connection, ObjectId, Types } from 'mongoose';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { DatabaseService } from 'src/contexts/shared/database/infraestructure/database.service';

import { UserPersonDto } from 'src/contexts/user/infraestructure/controller/dto/user.person.DTO';
import { userSub, userSubBusiness } from '../model/user.stub';
import { UserBusinessDto } from 'src/contexts/user/infraestructure/controller/dto/user.business.DTO';

let dbConnection: Connection;
let httpServer: any;
let app: any;

/*

Pendiente: Ver como arrojar disintos codigos de error para los casos. 
-> should throw an error if sector does not exist: Deberia arrojar 400
-> 

*/

describe('Create a Personal account', () => {
  beforeEach(async () => {
    if (dbConnection) {
      // Limpiar la base de datos si es necesario
      await dbConnection.collection('users').deleteMany({});
    }
  });

  afterAll(async () => {
    await dbConnection.close();
  });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
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
    expect(response.body.subscriptions).toEqual([]);
    expect(response.body.groups).toEqual([]);
    expect(response.body.magazines).toEqual([]);
    expect(response.body.board).toEqual([]);
    expect(response.body.post).toEqual([]);
    expect(response.body.userRelations).toEqual([]);
    expect(response.body.userPreferences).toEqual({
      searchPreference: [],
      backgroundColor: '',
      boardColor: '',
    });
  });

  it('should create a business account', async () => {
    const userBusinessDto: UserBusinessDto = {
      clerkId: userSubBusiness().clerkId,
      email: userSubBusiness().email,
      username: userSubBusiness().username,
      description: userSubBusiness().description,
      profilePhotoUrl: userSubBusiness().profilePhotoUrl,
      countryRegion: userSubBusiness().countryRegion,
      isActive: userSubBusiness().isActive,
      contact: userSubBusiness().contact,
      createdTime: userSubBusiness().createdTime,
      sector: userSubBusiness().sector,
      name: userSubBusiness().name,
      lastName: userSubBusiness().lastName,
      businessName: userSubBusiness().businessName,
    };

    const response = await request(httpServer)
      .post('/user/business')
      //.set('Authorization', `bearer ${token}`)
      .send(userBusinessDto as UserBusinessDto);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      clerkId: userBusinessDto.clerkId,
      email: userBusinessDto.email,
      username: userBusinessDto.username,
      description: userBusinessDto.description,
      profilePhotoUrl: userBusinessDto.profilePhotoUrl,
      countryRegion: userBusinessDto.countryRegion,
      isActive: userBusinessDto.isActive,
      createdTime: userBusinessDto.createdTime,
      name: userBusinessDto.name,
      lastName: userBusinessDto.lastName,
      businessName: userBusinessDto.businessName,
      sector: userBusinessDto.sector,
    });
    expect(response.body).toHaveProperty('_id');
    expect(Types.ObjectId.isValid(response.body.contact)).toBe(true);
    expect(response.body.subscriptions).toEqual([]);
    expect(response.body.groups).toEqual([]);
    expect(response.body.magazines).toEqual([]);
    expect(response.body.board).toEqual([]);
    expect(response.body.post).toEqual([]);
    expect(response.body.userRelations).toEqual([]);
    expect(response.body.userPreferences).toEqual({
      searchPreference: [],
      backgroundColor: '',
      boardColor: '',
    });
  });

  it('should throw an error if user already exists', async () => {
    await dbConnection.collection('users').insertOne(userSubBusiness());
    const userBusinessDto: UserBusinessDto = {
      clerkId: userSubBusiness().clerkId,
      email: userSubBusiness().email,
      username: userSubBusiness().username,
      description: userSubBusiness().description,
      profilePhotoUrl: userSubBusiness().profilePhotoUrl,
      countryRegion: userSubBusiness().countryRegion,
      isActive: userSubBusiness().isActive,
      contact: userSubBusiness().contact,
      createdTime: userSubBusiness().createdTime,
      sector: userSubBusiness().sector,
      name: userSubBusiness().name,
      lastName: userSubBusiness().lastName,
      businessName: userSubBusiness().businessName,
    };

    const response = await request(httpServer)
      .post('/user/business')
      //.set('Authorization', `bearer ${token}`)
      .send(userBusinessDto as UserBusinessDto);
    expect(response.status).toBe(500);
    expect(response.body.exception.errorResponse.code).toBe(11000);
    expect(response.body.exception.errorResponse.errmsg).toContain(
      'E11000 duplicate key error collection',
    );
  });

  it('should throw an error if sector does not exist', async () => {
    await dbConnection.collection('users').insertOne(userSubBusiness());
    const userBusinessDto: UserBusinessDto = {
      clerkId: userSubBusiness().clerkId,
      email: userSubBusiness().email,
      username: userSubBusiness().username,
      description: userSubBusiness().description,
      profilePhotoUrl: userSubBusiness().profilePhotoUrl,
      countryRegion: userSubBusiness().countryRegion,
      isActive: userSubBusiness().isActive,
      contact: userSubBusiness().contact,
      createdTime: userSubBusiness().createdTime,
      sector: '66d2177dda11f93d8647cf3d' as unknown as ObjectId,
      name: userSubBusiness().name,
      lastName: userSubBusiness().lastName,
      businessName: userSubBusiness().businessName,
    };

    const response = await request(httpServer)
      .post('/user/business')
      //.set('Authorization', `bearer ${token}`)
      .send(userBusinessDto as UserBusinessDto);
    expect(response.status).toBe(500);
  });
});
