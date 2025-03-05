import { Connection, Types } from "mongoose";


export enum UserType_test {
    Person = 'person',
    Business = 'business',
}
enum Gender {
    Male = 'M',
    Female = 'F',
    Other = 'O',
    Unknown = 'X',
}


interface UserTestRequest {
    _id: Types.ObjectId;
    clerkId: string;
    email: string;
    username: string;
    description?: string;
    profilePhotoUrl?: string;
    countryRegion?: string;
    isActive?: boolean;
    contact?: Types.ObjectId;
    createdTime?: string;
    subscriptions?: Types.ObjectId[];
    accountType?: Types.ObjectId;
    groups?: Types.ObjectId[];
    magazines?: Types.ObjectId[];
    board?: Types.ObjectId;
    posts?: Types.ObjectId[];
    userRelations?: Types.ObjectId[];
    userType: UserType_test;
    name: string;
    lastName: string;
    finder: string;
    userPreferences?: {
        searchPreference?: Types.ObjectId[];
        backgroundColor?: number;
    };
    notifications?: Types.ObjectId[];
    friendRequests?: Types.ObjectId[];
    activeRelations?: Types.ObjectId[];
}


async function createTestingUser_e2e(userRequest: UserTestRequest, dbConnection: Connection) {

    await dbConnection.collection('users').insertOne(userRequest);
    return userRequest;
}

export default createTestingUser_e2e;