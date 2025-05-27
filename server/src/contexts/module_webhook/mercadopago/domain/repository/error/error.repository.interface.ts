export interface ErrorRepositoryInterface{
    createNewError(user: string, body: any): Promise<any>
}