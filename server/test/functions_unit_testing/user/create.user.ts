import { random } from "lodash";
import { Types } from "mongoose";

export class PersonalAccountTestRequest {
    _id: Types.ObjectId;
    clerkId?: string;
    email?: string;
    username?: string;
    name?: string;
    lastName?: string;
    finder?: string;
    profilePhotoUrl?: string;
    userType?: string;
    userRelations?: any[];
    kind?: string;
    birthDate?: string;
    gender?: string;
    subscriptions?: any[];
    notifications?: string[];
    magazines?: Types.ObjectId[];
    posts?: Types.ObjectId[];
    groups?: Types.ObjectId[];
    attributes?: Map<string, string>
    dni?: string

}
async function createPersonalUser(
    userModel: any,
    personalAccountTestRequest: PersonalAccountTestRequest
) {
    const USER = await userModel.create({
        _id: personalAccountTestRequest._id,
        clerkId: personalAccountTestRequest.clerkId ?? 'TEST_B',
        email: personalAccountTestRequest.email ?? random(1, 100) + 'TEST_B@email.com' + random(1, 100),
        username: personalAccountTestRequest.username ?? random(1, 100) + 'TEST_B' + random(1, 100),
        name: personalAccountTestRequest.name ?? 'TEST_B',
        lastName: personalAccountTestRequest.lastName ?? 'TEST_B',
        finder: personalAccountTestRequest.finder ?? 'TEST_B',
        profilePhotoUrl: personalAccountTestRequest.profilePhotoUrl ?? 'TEST_B.jpg',
        userType: personalAccountTestRequest.userType ?? "Person",
        userRelations: personalAccountTestRequest.userRelations ?? [],
        kind: personalAccountTestRequest.kind ?? "Person",
        birthDate: personalAccountTestRequest.birthDate ?? "2000-01-01",
        gender: personalAccountTestRequest.gender ?? "M",
        subscriptions: personalAccountTestRequest.subscriptions ?? [],
        notifications: personalAccountTestRequest.notifications ?? [],
        magazines: personalAccountTestRequest.magazines ?? [],
        posts: personalAccountTestRequest.posts ?? [],
        groups: personalAccountTestRequest.groups ?? [],
        dni: personalAccountTestRequest.dni ?? "123"
    });

    return USER
}




export { createPersonalUser }