export interface UserServiceInterface {
	createUser(user: any): Promise<void>;
}