export interface ErrorServiceInterface {
    createNewError(user: string, body: any): Promise<any>;
}