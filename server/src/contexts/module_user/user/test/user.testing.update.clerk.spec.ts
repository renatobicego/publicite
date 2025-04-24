import { getModelToken } from '@nestjs/mongoose';
import mongoose, { Model, Connection, Types } from 'mongoose';
import { TestingModule } from '@nestjs/testing';

import { UP_clerkUpdateRequestDto } from 'src/contexts/module_webhook/clerk/application/dto/UP-clerk.update.request';
import { UserService } from '../application/service/user.service';
import { UserRepository } from '../infrastructure/repository/user.repository';
import { IUser, UserModel } from '../infrastructure/schemas/user.schema';
import { IUserPerson, UserPersonModel } from '../infrastructure/schemas/userPerson.schema';
import mapModuleTesting from './user.test.module';
import { UserType } from '../domain/entity/enum/user.enums';
import { personalAccountUpdateRequest } from '../application/adapter/dto/HTTP-REQUEST/user.personal.request.UPDATE';
import { Gender } from '../domain/entity/enum/user.enums';

describe('UserService - Update User by Clerk ID (Integration Test)', () => {
  let userService: UserService;
  let userRepository: UserRepository;
  let userModel: Model<IUser>;
  let userPersonModel: Model<IUserPerson>;
  let connection: Connection;

  beforeAll(async () => {
    const moduleRef: TestingModule =
      await mapModuleTesting.get('clerk-update')();

    userService = moduleRef.get<UserService>('UserServiceInterface');
    userRepository = moduleRef.get<UserRepository>('UserRepositoryInterface');
    userModel = moduleRef.get<Model<IUser>>(getModelToken(UserModel.modelName));
    userPersonModel = moduleRef.get<Model<IUserPerson>>(
      getModelToken(UserPersonModel.modelName),
    );

    connection = mongoose.connection;
  });

  afterAll(async () => {
    await userModel.deleteMany({});
    await connection.close();
  });

  it('should update user by clerkId in the database', async () => {
    await userModel.create({
      clerkId: '12345',
      email: 'original@email.com',
      username: 'originaluser',
      name: 'Original',
      lastName: 'User',
      finder: 'original_finder',
      profilePhotoUrl: 'original_url.jpg',
      userType: UserType.Person,
      dni: '12412412412412',
    });

    const updateRequest: UP_clerkUpdateRequestDto = {
      clerkId: '12345',
      name: 'Updated Name',
      lastName: 'Updated Last Name',
      username: 'updatedUser',
      profilePhotoUrl: 'updated_url.jpg',
      email: 'updated@email.com',
      finder: 'updated_finder',
    };

    await userService.updateUserByClerkId(updateRequest);

    const updatedUser = await userModel.findOne({ clerkId: '12345' });

    expect(updatedUser).toBeDefined();
    expect(updatedUser!.name).toBe(updateRequest.name);
    expect(updatedUser!.lastName).toBe(updateRequest.lastName);
    expect(updatedUser!.username).toBe(updateRequest.username);
    expect(updatedUser!.profilePhotoUrl).toBe(updateRequest.profilePhotoUrl);
    expect(updatedUser!.email).toBe(updateRequest.email);
    expect(updatedUser!.finder).toBe(updateRequest.finder);
  });

  it('should update dni in the database', async () => {
    await userPersonModel.create({
      clerkId: '123456789',
      email: 'original22@email.com',
      username: 'Maximan',
      name: 'Original',
      lastName: 'User',
      finder: 'original_finder',
      profilePhotoUrl: 'original_url.jpg',
      userType: "Person",
      dni: '123456',
      gender: Gender.Male,
      birthDate: '1990-01-01',
    });

    const updateRequest: personalAccountUpdateRequest = {
      dni: '1234',
    };

    await userService.updateUser('Maximan', updateRequest, UserType.Person);

    const updatedUser = await userModel.findOne({ clerkId: '123456789' });

    expect(updatedUser).toBeDefined();
    expect(updatedUser!.dni).toBe(updateRequest.dni);
  });
});
