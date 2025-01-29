import { InjectModel } from "@nestjs/mongoose";
import { ErrorRepositoryInterface } from "../../../domain/repository/error/error.repository.interface";
import { Model } from "mongoose";
import ErrorModel, { ErrorDocument } from "../../schemas/error.schema";

export class ErrorRepository implements ErrorRepositoryInterface {
    constructor(
        @InjectModel(ErrorModel.modelName)
        private readonly errorModel: Model<ErrorDocument>,
    ) { }

    async createNewError(user: string, body: any): Promise<any> {
        try {
            const errorDocument = new this.errorModel({
                user: user,
                code: body.code,
                message: body.message,
                result: body.result,
                event: body.event
            });

            await errorDocument.save();
        } catch (error: any) {
            throw error;
        }
    }
}   