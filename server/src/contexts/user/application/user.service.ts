// user.service.ts
import { Injectable } from '@nestjs/common';
import { UserServiceInterface } from '../domain/user-service.interface';

// MONGO
@Injectable()
export class UserService implements UserServiceInterface {
	async createUser(user: any): Promise<void> {
		console.log("Creating user...", user);
	}


}
