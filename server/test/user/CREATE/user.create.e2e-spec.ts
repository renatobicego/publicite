import { Test } from '@nestjs/testing';
import { Connection, ObjectId, Types } from 'mongoose';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { DatabaseService } from 'src/contexts/module_shared/database/infrastructure/database.service';
import { UserBusinessRequest, UserPersonRequest } from 'src/contexts/module_user/user/application/adapter/dto/HTTP-REQUEST/user.request.CREATE';
import { userSub, userSubBusiness } from '../../model/user.stub';
import { UserType } from 'src/contexts/module_user/user/domain/entity/enum/user.enums';






let dbConnection: Connection;
let httpServer: any;
let app: any;

/*

Pendiente: Ver como arrojar disintos codigos de error para los casos. 
-> should throw an error if sector does not exist: Deberia arrojar 400
-> 

*/

describe('Create  account', () => {
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
      isActive: userSub().isActive,
      name: userSub().name,
      lastName: userSub().lastName,
      contact: userSub().contact,
      createdTime: userSub().createdTime,
      subscriptions: userSub().subscriptions,
      groups: userSub().groups,
      magazines: userSub().magazines,
      board: userSub().board,
      posts: userSub().posts,
      userRelations: userSub().userRelations,
      userType: UserType.Person,
      userPreferences: userSub().userPreferences,
      activeRelations: userSub().activeRelations,
      gender: userSub().gender,
      birthDate: userSub().birthDate,
    };

    const response = await request(httpServer)
      .post('/user/personal')
      //.set('Authorization', `bearer ${token}`)
      .send(userPersonDto as UserPersonRequest);

    expect(response.status).toBe(201);
    expect(Types.ObjectId.isValid(response.body)).toBe(true);
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
      groups: userSubBusiness().groups,
      magazines: userSubBusiness().magazines,
      board: userSubBusiness().board,
      posts: userSubBusiness().posts,
      userRelations: userSubBusiness().userRelations,
      activeRelations: userSubBusiness().activeRelations,
      subscriptions: userSubBusiness().subscriptions
    };

    const response = await request(httpServer)
      .post('/user/business')
      //.set('Authorization', `bearer ${token}`)
      .send(userBusinessDto as UserBusinessRequest);


    expect(response.status).toBe(201);
    expect(Types.ObjectId.isValid(response.body)).toBe(true);


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
      groups: userSubBusiness().groups,
      magazines: userSubBusiness().magazines,
      board: userSubBusiness().board,
      posts: userSubBusiness().posts,
      userRelations: userSubBusiness().userRelations,
      activeRelations: userSubBusiness().activeRelations,
      subscriptions: userSubBusiness().subscriptions

    };

    const response: any = await request(httpServer)
      .post('/user/business')
      //.set('Authorization', `bearer ${token}`)
      .send(userBusinessDto as UserBusinessRequest);
    expect(response.status).toBe(500);
    console.log("--------- RESPONSE BODY:", response.body.message);
    console.log("--------- RESPONSE TEXT:", response.text);
    console.log("--------- RESPONSE STATUS:", response.status);

    expect(response.body.message).toContain(
      'E11000 duplicate key error collection',
    );
  });

  it('should throw an error if username already exists', async () => {
    await dbConnection.collection('users').insertOne(userSubBusiness());
    const userBusinessDto: UserBusinessRequest = {
      clerkId: userSubBusiness().clerkId,
      email: "testing@testing.com",
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
      groups: userSubBusiness().groups,
      magazines: userSubBusiness().magazines,
      board: userSubBusiness().board,
      posts: userSubBusiness().posts,
      userRelations: userSubBusiness().userRelations,
      activeRelations: userSubBusiness().activeRelations,
      subscriptions: userSubBusiness().subscriptions

    };

    const response: any = await request(httpServer)
      .post('/user/business')
      //.set('Authorization', `bearer ${token}`)
      .send(userBusinessDto as UserBusinessRequest);
    expect(response.status).toBe(500);
    console.log("--------- RESPONSE BODY:", response.body.message);
    console.log("--------- RESPONSE TEXT:", response.text);
    console.log("--------- RESPONSE STATUS:", response.status);

    expect(response.body.message).toContain(
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
      groups: userSubBusiness().groups,
      magazines: userSubBusiness().magazines,
      board: userSubBusiness().board,
      posts: userSubBusiness().posts,
      userRelations: userSubBusiness().userRelations,
      activeRelations: userSubBusiness().activeRelations,
      subscriptions: userSubBusiness().subscriptions
    };

    const response = await request(httpServer)
      .post('/user/business')
      //.set('Authorization', `bearer ${token}`)
      .send(userBusinessDto as UserBusinessRequest);
    expect(response.status).toBe(500);
  });
});
