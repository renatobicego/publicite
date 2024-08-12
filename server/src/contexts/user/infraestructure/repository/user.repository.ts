
import { Injectable, Logger } from '@nestjs/common';
import { UserRepositoryInterface } from '../../domain/user-service.interface';

import { CreateUserDto } from '../../application/Dtos/create-user.dto';
import { User } from '../../domain/entity/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from '../schemas/user.schema';



@Injectable()
export class UserRepository implements UserRepositoryInterface {
	private readonly logger = new Logger(UserRepository.name);

	constructor(
		@InjectModel('User') private readonly userModel: Model<UserDocument>,
	) { }


	async createUser(createUserDto: CreateUserDto): Promise<User> {
		try {
			
			this.logger.log("Creating user... in user repository");

			// Crea una instancia del modelo Mongoose
			const newUser = new this.userModel(createUserDto);

			// Guarda el usuario en la base de datos
			await newUser.save();

			// Retorna el usuario como una promesa
			return Promise.resolve(createUserDto);

		} catch (error: any) {
			this.logger.error("Error creating user... in user repository");
			throw new Error(error);
		}
	}
}
