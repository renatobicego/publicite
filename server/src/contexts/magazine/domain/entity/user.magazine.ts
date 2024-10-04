import { ObjectId } from "mongoose";

export class UserMagazine {
    private colaborators: ObjectId[];
    private user: ObjectId;
    private visibility: string;

}