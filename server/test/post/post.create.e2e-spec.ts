import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { Connection, Types } from 'mongoose';

import { AppModule } from 'src/app.module';
import {
  PostGoodRequest,
  PostPetitionRequest,
  PostServiceRequest,
} from 'src/contexts/post/application/adapter/dto/post.request';
import { DatabaseService } from 'src/contexts/shared/database/infraestructure/database.service';

import { Logger } from '@nestjs/common';
import {
  postGoodStub,
  postPetitionStub,
  postServiceStub,
} from '../model/post.stub';
import { userSub_id } from '../model/user.stub';

let dbConnection: Connection;
let httpServer: any;
let app: any;

describe('Create post suit test', () => {
  beforeEach(async () => {});
  afterEach(async () => {
    await dbConnection.collection('postLocations').deleteMany({});
    await dbConnection.collection('posts').deleteMany({});
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
    app.useLogger(new Logger());
    await app.init();

    dbConnection = moduleRef
      .get<DatabaseService>(DatabaseService)
      .getDBHandle();
    httpServer = app.getHttpServer();
    await dbConnection.collection('users').deleteMany({});
    await dbConnection.collection('users').insertOne(userSub_id());
  });

  it('should create a new post good and asociate it with a user', async () => {
    const PostRequest: PostGoodRequest = {
      title: postGoodStub().title,
      author: userSub_id()._id,
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
      .findOne({ _id: userSub_id()._id });
    expect(user).toBeTruthy();

    expect(user?.post.toString()).toContain(response.body._id.toString());
  });

  it('should create a new post service  and asociate it with a user', async () => {
    const PostRequest: PostServiceRequest = {
      title: postServiceStub().title,
      author: userSub_id()._id,
      postType: 'service',
      description: postServiceStub().description,
      visibility: postServiceStub().visibility,
      recomendations: postServiceStub().recomendations,
      price: postServiceStub().price,
      location: postServiceStub().location,
      category: postServiceStub().category,
      comments: postServiceStub().comments,
      attachedFiles: postServiceStub().attachedFiles,
      createAt: postServiceStub().createAt,
      frequencyPrice: postServiceStub().frequencyPrice,
      imageUrls: postServiceStub().imageUrls,
      reviews: postServiceStub().reviews,
    };

    const response = await request(httpServer)
      .post('/post')
      //.set('Authorization', `bearer ${token}`)
      .send(PostRequest);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      title: PostRequest.title,
      postType: 'service',
      description: PostRequest.description,
      visibility: PostRequest.visibility,
      recomendations: PostRequest.recomendations,
      price: PostRequest.price,
      category: PostRequest.category,
      comments: PostRequest.comments,
      attachedFiles: PostRequest.attachedFiles,
      createAt: PostRequest.createAt,
      frequencyPrice: PostRequest.frequencyPrice,
      imageUrls: PostRequest.imageUrls,
      reviews: PostRequest.reviews,
    });
    expect(response.body).toHaveProperty('_id');
    expect(Types.ObjectId.isValid(response.body.location)).toBe(true);

    const user = await dbConnection
      .collection('users')
      .findOne({ _id: userSub_id()._id });
    expect(user).toBeTruthy();

    expect(user?.post.toString()).toContain(response.body._id.toString());
  });

  it('should create a new post petition  and asociate it with a user', async () => {
    const PostRequest: PostPetitionRequest = {
      title: postPetitionStub().title,
      author: userSub_id()._id,
      postType: 'petition',
      description: postPetitionStub().description,
      visibility: postPetitionStub().visibility,
      recomendations: postPetitionStub().recomendations,
      price: postPetitionStub().price,
      location: postPetitionStub().location,
      category: postPetitionStub().category,
      comments: postPetitionStub().comments,
      attachedFiles: postPetitionStub().attachedFiles,
      createAt: postPetitionStub().createAt,
      toPrice: postPetitionStub().toPrice,
      frequencyPrice: postPetitionStub().frequencyPrice,
      petitionType: postPetitionStub().petitionType,
    };

    const response = await request(httpServer)
      .post('/post')
      //.set('Authorization', `bearer ${token}`)
      .send(PostRequest);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      title: PostRequest.title,
      postType: 'petition',
      description: PostRequest.description,
      visibility: PostRequest.visibility,
      recomendations: PostRequest.recomendations,
      price: PostRequest.price,
      category: PostRequest.category,
      comments: PostRequest.comments,
      attachedFiles: PostRequest.attachedFiles,
      createAt: PostRequest.createAt,
      toPrice: PostRequest.toPrice,
      frequencyPrice: PostRequest.frequencyPrice,
      petitionType: PostRequest.petitionType,
    });
    expect(response.body).toHaveProperty('_id');
    expect(Types.ObjectId.isValid(response.body.location)).toBe(true);

    const user = await dbConnection
      .collection('users')
      .findOne({ _id: userSub_id()._id });
    expect(user).toBeTruthy();

    expect(user?.post.toString()).toContain(response.body._id.toString());
  });
});
