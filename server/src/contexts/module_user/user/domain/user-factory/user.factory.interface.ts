
import { User } from "../entity/user.entity";

export interface UserFactoryInterface {
    createUser(userType: string, userRequest: any): User
}