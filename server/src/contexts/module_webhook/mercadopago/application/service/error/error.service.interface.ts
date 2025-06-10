import { InjectModel } from "@nestjs/mongoose";
import { ErrorServiceInterface } from "../../../domain/service/error/error.service.interface";
import { Inject } from "@nestjs/common";
import { ErrorRepositoryInterface } from "../../../domain/repository/error/error.repository.interface";

export class ErrorService implements ErrorServiceInterface {
    constructor(
        @Inject('ErrorRepositoryInterface')
        private readonly errorRepository: ErrorRepositoryInterface,
    ) {

    }

    async createNewError(user: string, body: any): Promise<any> {
        try {
            await this.errorRepository.createNewError(user, body);
        } catch (error: any) {
            throw error;
        }
    }
}