import { CreateUserDto } from "../application/Dtos/create-user.dto";
import {User } from "./entity/user.entity";

export interface UserRepositoryInterface {
	createUser(createUserDto: CreateUserDto): Promise<User> ;
}