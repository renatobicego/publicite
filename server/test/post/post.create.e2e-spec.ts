import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { Connection, Types } from 'mongoose';

import { AppModule } from 'src/app.module';
import { PostRequest } from 'src/contexts/post/application/adapter/dto/post.request';
import { DatabaseService } from 'src/contexts/shared/database/infraestructure/database.service';
import { postStub } from '../model/post.stub';

let dbConnection: Connection;
let httpServer: any;
let app: any;

describe('Create post suit test', () => {
  beforeEach(async () => {
    if (dbConnection) {
      // Limpiar la base de datos si es necesario
      await dbConnection.collection('PostLocations').deleteMany({});
      await dbConnection.collection('Posts').deleteMany({});
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

  it('should create a new post and asociate it with a user', async () => {
    const PostRequest: PostRequest = {
      title: postStub().title,
      author: postStub().author,
      postType: postStub().postType,
      description: postStub().description,
      visibility: postStub().visibility,
      recomendations: postStub().recomendations,
      price: postStub().price,
      location: postStub().location,
      category: postStub().category,
      comments: postStub().comments,
      attachedFiles: postStub().attachedFiles,
      createAt: postStub().createAt,
    };

    const response = await request(httpServer)
      .post('/post')
      //.set('Authorization', `bearer ${token}`)
      .send(PostRequest);

    expect(response.status).toBe(201);
    console.log(response.body);
    expect(response.body).toMatchObject({
      title: PostRequest.title,
      author: PostRequest.author,
      postType: PostRequest.postType,
      description: PostRequest.description,
      visibility: PostRequest.visibility,
      recomendations: PostRequest.recomendations,
      price: PostRequest.price,
      category: PostRequest.category,
      comments: PostRequest.comments,
      attachedFiles: PostRequest.attachedFiles,
      createAt: PostRequest.createAt,
    });
    expect(response.body).toHaveProperty('_id');
    expect(Types.ObjectId.isValid(response.body.location)).toBe(true);
  });
});
