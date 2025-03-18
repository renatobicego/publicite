import { Connection, ObjectId, Types } from 'mongoose';
import * as request from 'supertest';


import { UserBusinessRequest, UserPersonRequest } from 'src/contexts/module_user/user/application/adapter/dto/HTTP-REQUEST/user.request.CREATE';
import { UserType } from 'src/contexts/module_user/user/domain/entity/enum/user.enums';
import { userSub, userSubBusiness } from '../model/user.stub';
import startServerForE2ETest from '../../../test/getStartede2e-test';






let dbConnection: Connection;
let httpServer: any;
let app: any;



describe('Create  account', () => {



  beforeAll(async () => {
    const {
      databaseConnection,
      application,
      server } = await startServerForE2ETest();
    dbConnection = databaseConnection
    app = application
    httpServer = server
  });

  afterEach(async () => {
    await dbConnection.collection('users').deleteMany({});
  })

  afterAll(async () => {
    await dbConnection.close();
    await app.close();
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

    const user = await dbConnection.collection('users').findOne({ email: userSub().email });
    console.log(user)
    expect(user).toBeTruthy();
    expect(user?.clerkId).toBe(userSub().clerkId);
    expect(user?.email).toBe(userSub().email);
    expect(user?.username).toBe(userSub().username);
    expect(user?.description).toBe(userSub().description);
    expect(user?.profilePhotoUrl).toBe(userSub().profilePhotoUrl);
    expect(user?.countryRegion).toBe(userSub().countryRegion);
    expect(user?.isActive).toBe(userSub().isActive);
    expect(user?.name).toBe(userSub().name);
    expect(user?.lastName).toBe(userSub().lastName);
    expect(Types.ObjectId.isValid(user?.contact)).toBe(true);
    expect(user?.createdTime).toBe(userSub().createdTime);
    expect(user?.subscriptions.length).toBe(1)
    expect(user?.groups).toEqual(userSub().groups);
    expect(user?.magazines).toEqual(userSub().magazines);
    expect(user?.board).toBe(userSub().board);
    expect(user?.posts).toEqual(userSub().posts);
    expect(user?.userRelations).toEqual(userSub().userRelations);
    expect(user?.userType).toBe(userSub().userType);
    expect(user?.userPreferences.toString()).toEqual(userSub().userPreferences.toString());
    expect(user?.activeRelations).toEqual(userSub().activeRelations);
    expect(user?.gender).toBe(userSub().gender);
    expect(user?.birthDate).toBe(userSub().birthDate);






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

    const user = await dbConnection.collection('users').findOne({ clerkId: userSubBusiness().clerkId });
    expect(user).toBeTruthy();
    expect(user?.clerkId).toBe(userSubBusiness().clerkId);
    expect(user?.email).toBe(userSubBusiness().email);
    expect(user?.username).toBe(userSubBusiness().username);
    expect(user?.description).toBe(userSubBusiness().description);
    expect(user?.profilePhotoUrl).toBe(userSubBusiness().profilePhotoUrl);
    expect(user?.countryRegion).toBe(userSubBusiness().countryRegion);
    expect(user?.isActive).toBe(userSubBusiness().isActive);
    expect(user?.name).toBe(userSubBusiness().name);
    expect(user?.lastName).toBe(userSubBusiness().lastName);
    expect(Types.ObjectId.isValid(user?.contact)).toBe(true);
    expect(user?.createdTime).toBe(userSubBusiness().createdTime);
    expect(user?.subscriptions.length).toBe(1)
    expect(user?.sector.toString()).toEqual(userSubBusiness().sector.toString());
    expect(user?.businessName).toBe(userSubBusiness().businessName);
    expect(user?.groups).toEqual(userSubBusiness().groups);
    expect(user?.magazines).toEqual(userSubBusiness().magazines);
    expect(user?.board).toBe(userSubBusiness().board);
    expect(user?.posts).toEqual(userSubBusiness().posts);




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
