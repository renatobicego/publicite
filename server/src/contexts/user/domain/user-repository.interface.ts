import {User } from "./entity/user.entity";

export interface UserRepositoryInterface {
	createUser(user: User): Promise<User> ;
}