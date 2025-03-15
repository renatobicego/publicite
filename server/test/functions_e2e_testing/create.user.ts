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
    _id?: Types.ObjectId;
    clerkId?: string;
    email?: string;
    username?: string;
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
    userType?: UserType_test;
    name?: string;
    lastName?: string;
    finder?: string;
    userPreferences?: {
        searchPreference?: Types.ObjectId[];
        backgroundColor?: number;
    };
    notifications?: Types.ObjectId[];
    friendRequests?: Types.ObjectId[];
    activeRelations?: Types.ObjectId[];
}


async function createTestingUser_e2e(userRequest: UserTestRequest, dbConnection: Connection) {
    userRequest = {
        _id: userRequest._id ?? new Types.ObjectId(),
        clerkId: userRequest.clerkId ?? 'clerkId',
        email: userRequest.email ?? 'email',
        username: userRequest.username ?? 'username',
        description: userRequest.description ?? 'description',
        profilePhotoUrl: userRequest.profilePhotoUrl ?? 'profilePhotoUrl',
        countryRegion: userRequest.countryRegion ?? 'countryRegion',
        isActive: userRequest.isActive ?? true,
        contact: userRequest.contact ?? new Types.ObjectId(),
        createdTime: userRequest.createdTime ?? 'createdTime',
        subscriptions: userRequest.subscriptions ?? [],
        accountType: userRequest.accountType ?? new Types.ObjectId(),
        groups: userRequest.groups ?? [],
        magazines: userRequest.magazines ?? [],
        board: userRequest.board ?? new Types.ObjectId(),
        posts: userRequest.posts ?? [],
        userRelations: userRequest.userRelations ?? [],
        userType: userRequest.userType ?? UserType_test.Person,
        name: userRequest.name ?? 'name',
        lastName: userRequest.lastName ?? 'lastName',
        finder: userRequest.finder ?? 'finder',
        userPreferences: userRequest.userPreferences ?? {
            searchPreference: [],
            backgroundColor: 0,
        },
        notifications: userRequest.notifications ?? [],
        friendRequests: userRequest.friendRequests ?? [],
        activeRelations: userRequest.activeRelations ?? [],
    }
    await dbConnection.collection('users').insertOne(userRequest);
    return userRequest;
}

export default createTestingUser_e2e;