import { Test, TestingModule } from '@nestjs/testing';
import { Connection, ClientSession } from 'mongoose';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { UserServiceInterface } from 'src/contexts/module_user/user/domain/service/user.service.interface';

import { PostService } from './post.service';

import { Post } from '../../domain/entity/post.entity';
import { PostRepositoryInterface } from '../../domain/repository/post.repository.interface';
import { PostServiceInterface } from '../../domain/service/post.service.interface';

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

    // post = new PostGood(

    // );
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
      throw error; // Volver a lanzar el error para que Jest lo registre
    }
  });
});
