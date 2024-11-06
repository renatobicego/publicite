import { Request } from "express";

export interface CustomContextRequestInterface extends Request {
    userRequestId: string;
}