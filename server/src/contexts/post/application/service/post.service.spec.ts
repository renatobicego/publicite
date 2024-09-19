import { Test, TestingModule } from '@nestjs/testing';
import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { UserServiceInterface } from 'src/contexts/user/domain/service/user.service.interface';
import { Connection, ClientSession } from 'mongoose';
import { PostService } from 'src/contexts/post/application/service/post.service';
import { PostRepositoryInterface } from 'src/contexts/post/domain/repository/post.repository.interface';
import { PostGood } from 'src/contexts/post/domain/entity/post-types/post.good.entity';

import { postGoodStub } from '../../../../../test/model/post.stub';
import { PostServiceInterface } from '../../domain/service/post.service.interface';
import { Post } from '../../domain/entity/post.entity';

describe('PostService', () => {
  let postService: PostServiceInterface;
  let postRepository: PostRepositoryInterface;
  let userService: UserServiceInterface;
  let connection: Connection;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let logger: MyLoggerService;
  let session: ClientSession;
  let post: Post;
  const locationId = 'someLocationId';

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        PostService,
        {
          provide: 'PostRepositoryInterface',
          useValue: {
            saveLocation: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: 'UserServiceInterface',
          useValue: {
            saveNewPost: jest.fn(),
          },
        },
        {
          provide: MyLoggerService,
          useValue: {
            error: jest.fn(),
          },
        },
        {
          provide: Connection,
          useValue: {
            startSession: jest.fn().mockReturnValue({
              startTransaction: jest.fn(),
              commitTransaction: jest.fn(),
              abortTransaction: jest.fn(),
              endSession: jest.fn(),
            }),
          },
        },
      ],
    }).compile();

    postService = module.get<PostService>(PostService);
    postRepository = module.get<PostRepositoryInterface>(
      'PostRepositoryInterface',
    );
    userService = module.get<UserServiceInterface>('UserServiceInterface');
    connection = module.get<Connection>(Connection); // Obtener la conexión mockeada
    logger = module.get<MyLoggerService>(MyLoggerService);
    session = await connection.startSession();

    post = new PostGood(
      postGoodStub().title,
      postGoodStub().author,
      postGoodStub().postType,
      postGoodStub().description,
      postGoodStub().visibility,
      postGoodStub().recomendations as any,
      postGoodStub().price,
      postGoodStub().location as any,
      postGoodStub().category ?? [],
      postGoodStub().comments ?? [],
      postGoodStub().attachedFiles ?? [],
      postGoodStub().createAt,
      postGoodStub().imageUrls,
      postGoodStub().year ?? null,
      postGoodStub().brand ?? null,
      postGoodStub().modelType ?? null,
      postGoodStub().reviews ?? [],
      postGoodStub().condition ?? null,
    );
  });

  it('debería hacer rollback si ocurre un error al guardar la ubicación', async () => {
    postRepository.saveLocation = jest
      .fn()
      .mockRejectedValue(new Error('Error al guardar ubicación'));

    await expect(postService.create(post)).rejects.toThrow(
      'Error al guardar ubicación',
    );
    expect(session.abortTransaction).toHaveBeenCalled();
    expect(session.endSession).toHaveBeenCalled();
  });

  it('debería hacer rollback si ocurre un error al guardar el post en el usuario', async () => {
    postRepository.saveLocation = jest.fn().mockResolvedValue(locationId);
    postRepository.create = jest.fn().mockResolvedValue(post);
    userService.saveNewPost = jest.fn().mockRejectedValue(new Error());

    expect(session.abortTransaction).toHaveBeenCalled();
    expect(session.endSession).toHaveBeenCalled();
  });

  it('debería commitear la transacción cuando todo funcione correctamente', async () => {
    try {
      postRepository.saveLocation = jest.fn().mockResolvedValue(locationId);
      postRepository.create = jest.fn().mockResolvedValue(post);
      userService.saveNewPost = jest.fn().mockResolvedValue(Promise.resolve());

      expect(session.startTransaction).toHaveBeenCalled();
      expect(session.commitTransaction).toHaveBeenCalled();
      expect(session.endSession).toHaveBeenCalled();
    } catch (error) {
      console.log('Error lanzado:', error);
      console.log(error); // Para capturar y ver el error
      throw error; // Volver a lanzar el error para que Jest lo registre
    }
  });
});
