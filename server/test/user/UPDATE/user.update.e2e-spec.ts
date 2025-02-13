import { Test } from '@nestjs/testing';
import { Connection, Types } from 'mongoose';
import * as request from 'supertest';

import { AppModule } from 'src/app.module';
import { DatabaseService } from 'src/contexts/module_shared/database/infrastructure/database.service';
import { UserType } from 'src/contexts/module_user/user/domain/entity/enum/user.enums';
import { userSub, userSubBusiness } from '../../model/user.stub';
import { UserBusinessRequest, UserPersonRequest } from 'src/contexts/module_user/user/application/adapter/dto/HTTP-REQUEST/user.request.CREATE';


let dbConnection: Connection;
let httpServer: any;
let app: any;
const token = process.env.TEST_TOKEN as string;


// TO DO: FALTA TEST, chnequear que el user cuando se crea tiene que tener la suscripcion free 67ad4c4bdb9283528cea83b9

const createPersonalUser = async () => {
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

  await request(httpServer)
    .post('/user/personal')
    .send(userPersonDto as UserPersonRequest);


}

const createBusinessUser = async () => {
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

  await request(httpServer)
    .post('/user/business')
    .send(userBusinessDto as UserBusinessRequest);



}




describe('Update a Personal Account', () => {
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    dbConnection = moduleRef.get<DatabaseService>(DatabaseService).getDBHandle();
    httpServer = app.getHttpServer();


    await dbConnection.collection('users').deleteMany({});
    await createPersonalUser()
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

    });

    expect(response.status).toBe(200);
    expect(userUpdated).toBeTruthy();
    expect(userUpdated?.birthDate).toBe('2000-01-01');
  });

  it('updates a personal account - GENDER and birthDate is not updated', async () => {
    const { response, userUpdated } = await updateUser({
      gender: "F",

    });

    expect(response.status).toBe(200);
    expect(userUpdated).toBeTruthy();
    expect(userUpdated?.birthDate).toBe('2000-01-01');
    expect(userUpdated?.gender).toBe("F");

  });

  it('updates a personal account - countryRegion and birthDate, gender is not updated', async () => {
    const { response, userUpdated } = await updateUser({
      countryRegion: "Peru",

    });

    expect(response.status).toBe(200);
    expect(userUpdated).toBeTruthy();
    expect(userUpdated?.birthDate).toBe('2000-01-01');
    expect(userUpdated?.gender).toBe("F");
    expect(userUpdated?.countryRegion).toBe("Peru");

  });

  it('updates a personal account - description and birthDate, gender,countryRegion is not updated', async () => {
    const { response, userUpdated } = await updateUser({
      description: "Esto esta modificado"
    });

    expect(response.status).toBe(200);
    expect(userUpdated).toBeTruthy();
    expect(userUpdated?.birthDate).toBe('2000-01-01');
    expect(userUpdated?.gender).toBe("F");
    expect(userUpdated?.countryRegion).toBe("Peru");
    expect(userUpdated?.description).toBe("Esto esta modificado");

  });


  it('updates a personal account - description and birthDate, gender,countryRegion is not updated', async () => {
    const { response, userUpdated } = await updateUser({
      description: "Esto esta modificado"
    });

    expect(response.status).toBe(200);
    expect(userUpdated).toBeTruthy();
    expect(userUpdated?.birthDate).toBe('2000-01-01');
    expect(userUpdated?.gender).toBe("F");
    expect(userUpdated?.countryRegion).toBe("Peru");
    expect(userUpdated?.description).toBe("Esto esta modificado");

  });



});



describe('Update an Business Account', () => {
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    dbConnection = moduleRef.get<DatabaseService>(DatabaseService).getDBHandle();
    httpServer = app.getHttpServer();

    await dbConnection.collection('sectors').deleteOne({ _id: new Types.ObjectId("66d2177dda11f93d8647cf3b") });
    await dbConnection.collection('users').deleteMany({});
    await dbConnection.collection('sectors').insertOne({
      _id: new Types.ObjectId("66d2177dda11f93d8647cf3b"),
      label: "Agricultura",
      description: "Agricultura"
    });
    await createBusinessUser()
  });

  afterAll(async () => {
    await dbConnection.close();
    await app.close();
  });

  const updateUserBusiness = async (updateData: Record<string, any>) => {
    const response = await request(httpServer)
      .put(`/user/business/${userSubBusiness().username}`)
      .set('Authorization', `bearer ${token}`)
      .send(updateData);

    const userUpdated = await dbConnection.collection('users').findOne({ username: userSubBusiness().username });
    return { response, userUpdated };
  };





  it('updates a business account - businessName', async () => {
    const { response, userUpdated } = await updateUserBusiness({
      businessName: 'nuevo nombre de negocio',

    });

    expect(response.status).toBe(200);
    expect(userUpdated).toBeTruthy();
    expect(userUpdated?.businessName).toBe('nuevo nombre de negocio');
  });

  it('updates a business account - sector and businessName is not updated', async () => {
    const { response, userUpdated } = await updateUserBusiness({
      sector: "66d2177dda11f93d8647cf3b",

    });

    expect(response.status).toBe(200);
    expect(userUpdated).toBeTruthy();
    expect(userUpdated?.businessName).toBe('nuevo nombre de negocio');
    expect(userUpdated?.sector.toString()).toBe("66d2177dda11f93d8647cf3b");

  });

  it('updates a business account - countryRegion and businessName, sector is not updated', async () => {
    const { response, userUpdated } = await updateUserBusiness({
      countryRegion: "Peru",
    });

    expect(response.status).toBe(200);
    expect(userUpdated).toBeTruthy();
    expect(userUpdated?.businessName).toBe('nuevo nombre de negocio');
    expect(userUpdated?.sector.toString()).toBe("66d2177dda11f93d8647cf3b");
    expect(userUpdated?.countryRegion).toBe("Peru");

  });

  it('updates a business account - description and countryRegion, businessName,sector is not updated', async () => {
    const { response, userUpdated } = await updateUserBusiness({
      description: "Esto esta modificado 222"
    });

    expect(response.status).toBe(200);
    expect(userUpdated).toBeTruthy();
    expect(userUpdated?.businessName).toBe('nuevo nombre de negocio');
    expect(userUpdated?.sector.toString()).toBe("66d2177dda11f93d8647cf3b");
    expect(userUpdated?.countryRegion).toBe("Peru");
    expect(userUpdated?.description).toBe("Esto esta modificado 222");

  });



  it('should return error if sector does not exist', async () => {
    const { response, userUpdated } = await updateUserBusiness({
      sector: "67abcd4c2dce813e20663af1"
    });
    let res = response as any
    expect(response.status).toBe(500);
    expect(userUpdated).toBeTruthy();
    expect(userUpdated?.sector.toString()).toBe("66d2177dda11f93d8647cf3b");



  });






});


describe('Update user-preferences (Business & Personal Account)', () => {
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    dbConnection = moduleRef.get<DatabaseService>(DatabaseService).getDBHandle();
    httpServer = app.getHttpServer();
    await dbConnection.collection('postcategories').deleteMany({})
    await dbConnection.collection('users').deleteMany({});
    await dbConnection.collection('postcategories').insertOne({
      _id: new Types.ObjectId("66d2177dda11f93d8647cf3b"),
      label: "Agricultura",
    })
    await dbConnection.collection('postcategories').insertOne({
      _id: new Types.ObjectId("66d2177dda11f93d8647cf3c"),
      label: "Tecnologia",
    })

    await createBusinessUser()
    await createPersonalUser()

  });

  afterAll(async () => {
    await dbConnection.close();
    await app.close();
  });


  const updateUserBusiness_userPreferences = async (updateData: Record<string, any>, username: string) => {
    const response = await request(httpServer)
      .put(`/user/user-preferences/${username}`)
      .set('Authorization', `bearer ${token}`)
      .send(updateData);

    const userUpdated = await dbConnection.collection('users').findOne({ username: username });
    return { response, userUpdated };
  };





  it('updates a business account - user preferences ( backgroundColor ) ', async () => {
    const bkColor = 4545;
    const searchPreference = "66d2177dda11f93d8647cf3b"
    const { response, userUpdated } = await updateUserBusiness_userPreferences({
      backgroundColor: bkColor,
      searchPreference: searchPreference
    }, userSubBusiness().username);

    expect(response.status).toBe(200);
    expect(userUpdated).toBeTruthy();
    expect(userUpdated?.userPreferences?.backgroundColor).toBe(bkColor);
    expect(userUpdated?.userPreferences?.searchPreference.toString()).toEqual(searchPreference);
  });


  it('updates a business account - user preferences ( searchPreference ) ', async () => {
    const searchPreference = "66d2177dda11f93d8647cf3c"
    const bkColor = 4545;
    const { response, userUpdated } = await updateUserBusiness_userPreferences({
      backgroundColor: bkColor,
      searchPreference: searchPreference,
    }, userSubBusiness().username);

    expect(response.status).toBe(200);
    expect(userUpdated).toBeTruthy();
    expect(userUpdated?.userPreferences?.searchPreference.toString()).toEqual(searchPreference);
    expect(userUpdated?.userPreferences?.backgroundColor).toEqual(bkColor);
  });





  it('updates a Personal account - user preferences ( backgroundColor ) ', async () => {
    const bkColor = 15234;
    const searchPreference = "66d2177dda11f93d8647cf3b"
    const { response, userUpdated } = await updateUserBusiness_userPreferences({
      backgroundColor: bkColor,
      searchPreference: searchPreference,
    }, userSub().username);

    expect(response.status).toBe(200);
    expect(userUpdated).toBeTruthy();
    expect(userUpdated?.userPreferences?.backgroundColor).toBe(bkColor);
    expect(userUpdated?.userPreferences?.searchPreference.toString()).toEqual(searchPreference);

  });


  it('updates a Personal account - user preferences ( searchPreference ) ', async () => {
    const bkColor = 15234
    const searchPreference = "66d2177dda11f93d8647cf3c"
    const { response, userUpdated } = await updateUserBusiness_userPreferences({
      backgroundColor: bkColor,
      searchPreference: searchPreference,
    }, userSub().username);

    expect(response.status).toBe(200);
    expect(userUpdated).toBeTruthy();
    expect(userUpdated?.userPreferences?.backgroundColor).toBe(bkColor);
    expect(userUpdated?.userPreferences?.searchPreference.toString()).toEqual(searchPreference);
  });


});

