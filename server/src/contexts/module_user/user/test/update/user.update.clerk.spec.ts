import { Test } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';

import { Connection, Model } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import { UP_clerkUpdateRequestDto } from 'src/contexts/module_webhook/clerk/application/dto/UP-clerk.update.request';
import { UserService } from '../../application/service/user.service';
import { UserRepository } from '../../infrastructure/repository/user.repository';
import { IUser, UserModel } from '../../infrastructure/schemas/user.schema';
import { ContactModule } from 'src/contexts/module_user/contact/infrastructure/module/contact.module';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { EmitterService } from 'src/contexts/module_shared/event-emmiter/emmiter';
import * as dotenv from 'dotenv';
import { MagazineModel } from 'src/contexts/module_magazine/magazine/infrastructure/schemas/magazine.schema';
import { UserRelationModel } from '../../infrastructure/schemas/user.relation.schema';
import { UserBusinessModel } from '../../infrastructure/schemas/userBussiness.schema';
import { UserPersonModel } from '../../infrastructure/schemas/userPerson.schema';



describe('UserService - Update User by Clerk ID (Integration Test)', () => {
    let userService: UserService;
    let userRepository: UserRepository;
    let userModel: Model<IUser>;
    let mongoServer: MongoMemoryServer;
    dotenv.config();
    let connection: Connection;
    const uri = process.env.DATABASE_URI_TEST;
    beforeAll(async () => {

        mongoServer = await MongoMemoryServer.create();
        const moduleRef = await Test.createTestingModule({
            imports: [
                ContactModule,
                MongooseModule.forRootAsync({
                    useFactory: async () => {
                        return {
                            uri: uri,

                        };
                    },
                }),
                MongooseModule.forFeature([
                    {
                        name: UserModel.modelName,
                        schema: UserModel.schema,
                    },
                ]),

            ],
            providers: [
                MyLoggerService,

                {
                    provide: 'UserServiceInterface',
                    useClass: UserService,
                },
                {
                    provide: 'UserRepositoryInterface',
                    useClass: UserRepository,
                },
                {
                    provide: EmitterService,
                    useValue: {},
                },
                {
                    provide: EmitterService,
                    useValue: {},
                },
                {
                    provide: 'SectorRepositoryInterface',
                    useValue: {},
                },
                {
                    provide: getModelToken(UserPersonModel.modelName),
                    useValue: {},
                },
                {
                    provide: getModelToken(UserBusinessModel.modelName),
                    useValue: {},
                },
                {
                    provide: getModelToken(UserRelationModel.modelName),
                    useValue: {},
                },
                {
                    provide: getModelToken(MagazineModel.modelName),
                    useValue: {},
                },
            ],
        }).compile();

        userService = moduleRef.get<UserService>('UserServiceInterface');
        userRepository = moduleRef.get<UserRepository>('UserRepositoryInterface');
        userModel = moduleRef.get<Model<IUser>>(getModelToken(UserModel.modelName));


        connection = mongoose.connection;
    });

    afterEach(async () => {
        await userModel.deleteMany({});
    });

    afterAll(async () => {
        await connection.close();
        await mongoServer.stop();
    });

    it('should update user by clerkId in the database', async () => {
        // 1. Crear un usuario en la base de datos
        const initialUser = await userModel.create({
            clerkId: '12345',
            email: 'original@email.com',
            username: 'originaluser',
            name: 'Original',
            lastName: 'User',
            finder: 'original_finder',
            profilePhotoUrl: 'original_url.jpg',
        });

        // 2. Definir la request de actualización
        const updateRequest: UP_clerkUpdateRequestDto = {
            clerkId: '12345',
            name: 'Updated Name',
            lastName: 'Updated Last Name',
            username: 'updatedUser',
            profilePhotoUrl: 'updated_url.jpg',
            email: 'updated@email.com',
            finder: 'updated_finder',
        };

        // 3. Llamar al servicio para actualizar el usuario
        await userService.updateUserByClerkId(updateRequest);

        // 4. Obtener el usuario actualizado desde la base de datos
        const updatedUser = await userModel.findOne({ clerkId: '12345' });

        // 5. Verificaciones
        expect(updatedUser).toBeDefined();
        expect(updatedUser!.name).toBe(updateRequest.name);
        expect(updatedUser!.lastName).toBe(updateRequest.lastName);
        expect(updatedUser!.username).toBe(updateRequest.username);
        expect(updatedUser!.profilePhotoUrl).toBe(updateRequest.profilePhotoUrl);
        expect(updatedUser!.email).toBe(updateRequest.email);
        expect(updatedUser!.finder).toBe(updateRequest.finder);
    });
});
