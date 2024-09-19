import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { Connection, Types } from 'mongoose';

import { AppModule } from 'src/app.module';
import { PostGoodRequest } from 'src/contexts/post/application/adapter/dto/post.request';
import { DatabaseService } from 'src/contexts/shared/database/infraestructure/database.service';

import { Logger } from '@nestjs/common';
import { postGoodStub } from '../model/post.stub';
import { userSub_id } from '../model/user.stub';

let dbConnection: Connection;
let httpServer: any;
let app: any;

describe('Create post suit test', () => {
  beforeEach(async () => {
    if (dbConnection) {
      // Limpiar la base de datos si es necesario
      await dbConnection.collection('postLocations').deleteMany({});
      await dbConnection.collection('posts').deleteMany({});
      await dbConnection.collection('users').insertOne(userSub_id());
    }
  });

  afterAll(async () => {
    await dbConnection.collection('postLocations').deleteMany({});
    await dbConnection.collection('posts').deleteMany({});
    await dbConnection.collection('users').deleteMany({});
    await dbConnection.close();
  });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useLogger(new Logger());
    await app.init();

    dbConnection = moduleRef
      .get<DatabaseService>(DatabaseService)
      .getDBHandle();
    httpServer = app.getHttpServer();
  });

  it('should create a new postgood and asociate it with a user', async () => {
    const PostRequest: PostGoodRequest = {
      title: postGoodStub().title,
      author: userSub_id().clerkId,
      postType: postGoodStub().postType,
      description: postGoodStub().description,
      visibility: postGoodStub().visibility,
      recomendations: postGoodStub().recomendations,
      price: postGoodStub().price,
      location: postGoodStub().location,
      category: postGoodStub().category,
      comments: postGoodStub().comments,
      attachedFiles: postGoodStub().attachedFiles,
      createAt: postGoodStub().createAt,
      imageUrls: postGoodStub().imageUrls,
      year: postGoodStub().year,
      brand: postGoodStub().brand,
      modelType: postGoodStub().modelType,
      reviews: postGoodStub().reviews,
      condition: postGoodStub().condition,
    };

    const response = await request(httpServer)
      .post('/post')
      //.set('Authorization', `bearer ${token}`)
      .send(PostRequest);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      title: PostRequest.title,
      postType: PostRequest.postType.toString().toLowerCase(),
      description: PostRequest.description,
      visibility: PostRequest.visibility,
      recomendations: PostRequest.recomendations,
      price: PostRequest.price,
      category: PostRequest.category,
      comments: PostRequest.comments,
      attachedFiles: PostRequest.attachedFiles,
      createAt: PostRequest.createAt,
      imageUrls: PostRequest.imageUrls,
      year: PostRequest.year,
      brand: PostRequest.brand,
      modelType: PostRequest.modelType,
      reviews: PostRequest.reviews,
      condition: PostRequest.condition,
    });
    expect(response.body).toHaveProperty('_id');
    expect(Types.ObjectId.isValid(response.body.location)).toBe(true);

    const user = await dbConnection
      .collection('users')
      .findOne({ clerkId: userSub_id().clerkId });
    expect(user).toBeTruthy();

    expect(user?.post.toString()).toContain(response.body._id.toString());
  });
});
