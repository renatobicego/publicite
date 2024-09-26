import { Test } from '@nestjs/testing';
import { Connection, ObjectId, Types } from 'mongoose';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { DatabaseService } from 'src/contexts/shared/database/infraestructure/database.service';

import { userSub, userSubBusiness } from '../../test/model/user.stub';
import {
  UserBusinessRequest,
  UserPersonRequest,
} from 'src/contexts/user/application/adapter/dto/HTTP-REQUEST/user.request.CREATE';

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
    // Limpiar la base de datos si es necesario
    await dbConnection.collection('users').deleteMany({});
  });

  afterAll(async () => {
    await dbConnection.close();
    await app.close();
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
    const userPersonDto: UserPersonRequest = {
      clerkId: userSub().clerkId,
      email: userSub().email,
      username: userSub().username,
      description: userSub().description,
      profilePhotoUrl: userSub().profilePhotoUrl,
      countryRegion: userSub().countryRegion,
      name: userSub().name,
      lastName: userSub().lastName,
      isActive: userSub().isActive,
      contact: userSub().contact,
      createdTime: userSub().createdTime,
      userType: userSub().userType,
      gender: userSub().gender,
      birthDate: userSub().birthDate,
      userPreferences: userSub().userPreferences,
    };

    const response = await request(httpServer)
      .post('/user/personal')
      //.set('Authorization', `bearer ${token}`)
      .send(userPersonDto as UserPersonRequest);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      clerkId: userPersonDto.clerkId,
      email: userPersonDto.email,
      username: userPersonDto.username,
      description: userPersonDto.description,
      profilePhotoUrl: userPersonDto.profilePhotoUrl,
      countryRegion: userPersonDto.countryRegion,
      name: userPersonDto.name,
      lastName: userPersonDto.lastName,
      isActive: userPersonDto.isActive,
      createdTime: userPersonDto.createdTime,
      userType: userPersonDto.userType,
      userPreferences: userPersonDto.userPreferences,
      gender: userPersonDto.gender,
      birthDate: userPersonDto.birthDate,
    });
    expect(response.body).toHaveProperty('_id');
    //expect(Types.ObjectId.isValid(response.body.contact)).toBe(true);
    expect(response.body.subscriptions).toEqual([]);
    expect(response.body.groups).toEqual([]);
    expect(response.body.magazines).toEqual([]);
    expect(response.body.board).toEqual([]);
    expect(response.body.post).toEqual([]);
    expect(response.body.userRelations).toEqual([]);
    expect(Types.ObjectId.isValid(response.body.contact)).toBe(true);
  });

  it('should create a business account', async () => {
    const userBusinessDto: UserBusinessRequest = {
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
      userType: userSubBusiness().userType,
      userPreferences: userSubBusiness().userPreferences,
    };

    const response = await request(httpServer)
      .post('/user/business')
      //.set('Authorization', `bearer ${token}`)
      .send(userBusinessDto as UserBusinessRequest);

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
      backgroundColor: 12,
    });
  });

  it('should throw an error if user already exists', async () => {
    await dbConnection.collection('users').insertOne(userSubBusiness());
    const userBusinessDto: UserBusinessRequest = {
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
      userType: userSubBusiness().userType,
      userPreferences: userSubBusiness().userPreferences,
    };

    const response = await request(httpServer)
      .post('/user/business')
      //.set('Authorization', `bearer ${token}`)
      .send(userBusinessDto as UserBusinessRequest);
    expect(response.status).toBe(500);
    expect(response.body.exception.errorResponse.code).toBe(11000);
    expect(response.body.exception.errorResponse.errmsg).toContain(
      'E11000 duplicate key error collection',
    );
  });

  it('should throw an error if sector does not exist', async () => {
    const userBusinessDto: UserBusinessRequest = {
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
      userType: userSubBusiness().userType,
      userPreferences: userSubBusiness().userPreferences,
    };

    const response = await request(httpServer)
      .post('/user/business')
      //.set('Authorization', `bearer ${token}`)
      .send(userBusinessDto as UserBusinessRequest);
    expect(response.status).toBe(500);
  });
});
