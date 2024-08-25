// import { Injectable, Logger } from '@nestjs/common';
// import { UserRepositoryInterface } from '../../domain/user-repository.interface';

// import { User } from '../../domain/entity/user.entity';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';

// @Injectable()
// export class UserRepository implements UserRepositoryInterface {
//   private readonly logger = new Logger(UserRepository.name);

//   constructor(
//     @InjectModel('User') private readonly userModel: Model<UserDocument>,
//   ) {}

//   async createUser(user: User): Promise<User> {
//     try {
//       this.logger.log('Creating user... in user repository');

//       // Crea una instancia del modelo Mongoose
//       const newUser = new this.userModel(user);

//       // Guarda el usuario en la base de datos
//       await newUser.save();

//       // Retorna el usuario como una promesa
//       return Promise.resolve(user);
//     } catch (error: any) {
//       this.logger.error('Error creating user... in user repository');
//       throw new Error(error);
//     }
//   }
// }
