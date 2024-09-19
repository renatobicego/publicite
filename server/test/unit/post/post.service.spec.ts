// import { Test, TestingModule } from '@nestjs/testing';

// import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
// import { UserServiceInterface } from 'src/contexts/user/domain/service/user.service.interface';
// import { Connection, ClientSession } from 'mongoose';
// import { PostService } from 'src/contexts/post/application/service/post.service';
// import { PostRepositoryInterface } from 'src/contexts/post/domain/repository/post.repository.interface';

// describe('PostService', () => {
//   let postService: PostService;
//   let postRepository: PostRepositoryInterface;
//   let userService: UserServiceInterface;
//   let connection: Connection;
//   let logger: MyLoggerService;
//   let session: ClientSession;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         PostService,
//         {
//           provide: 'PostRepositoryInterface',
//           useValue: {
//             saveLocation: jest.fn(),
//             create: jest.fn(),
//           },
//         },
//         {
//           provide: 'UserServiceInterface',
//           useValue: {
//             saveNewPost: jest.fn(),
//           },
//         },
//         {
//           provide: MyLoggerService,
//           useValue: {
//             error: jest.fn(),
//           },
//         },
//         {
//           provide: Connection,
//           useValue: {
//             startSession: jest.fn().mockReturnValue({
//               startTransaction: jest.fn(),
//               commitTransaction: jest.fn(),
//               abortTransaction: jest.fn(),
//               endSession: jest.fn(),
//             }),
//           },
//         },
//       ],
//     }).compile();

//     postService = module.get<PostService>(PostService);
//     postRepository = module.get<PostRepositoryInterface>(
//       'PostRepositoryInterface',
//     );
//     userService = module.get<UserServiceInterface>('UserServiceInterface');
//     connection = module.get<Connection>(Connection);
//     logger = module.get<MyLoggerService>(MyLoggerService);
//     session = await connection.startSession();
//   });

//   it('debería hacer rollback si ocurre un error al guardar la ubicación', async () => {
//     const post = new Post(); // Simula un post válido
//     postRepository.saveLocation = jest
//       .fn()
//       .mockRejectedValue(new Error('Error al guardar ubicación'));

//     await expect(postService.create(post)).rejects.toThrow(
//       'Error al guardar ubicación',
//     );
//     expect(session.abortTransaction).toHaveBeenCalled();
//     expect(session.endSession).toHaveBeenCalled();
//   });

//   it('debería hacer rollback si ocurre un error al guardar el post en el usuario', async () => {
//     const post = new Post(); // Simula un post válido
//     const locationId = 'someLocationId'; // Simula un ObjectId válido
//     postRepository.saveLocation = jest.fn().mockResolvedValue(locationId);
//     postRepository.create = jest.fn().mockResolvedValue(post);
//     userService.saveNewPost = jest
//       .fn()
//       .mockRejectedValue(new Error('Error al guardar post en el usuario'));

//     await expect(postService.create(post)).rejects.toThrow(
//       'Error al guardar post en el usuario',
//     );
//     expect(session.abortTransaction).toHaveBeenCalled();
//     expect(session.endSession).toHaveBeenCalled();
//   });

//   it('debería commitear la transacción cuando todo funcione correctamente', async () => {
//     const post = new Post(); // Simula un post válido
//     const locationId = 'someLocationId'; // Simula un ObjectId válido
//     postRepository.saveLocation = jest.fn().mockResolvedValue(locationId);
//     postRepository.create = jest.fn().mockResolvedValue(post);
//     userService.saveNewPost = jest.fn().mockResolvedValue(true);

//     const result = await postService.create(post);

//     expect(session.commitTransaction).toHaveBeenCalled();
//     expect(session.endSession).toHaveBeenCalled();
//     expect(result).toEqual(post);
//   });
// });
