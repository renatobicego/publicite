import { random } from "lodash";
import { Types } from "mongoose";


async function createPersonalUser(user_id: Types.ObjectId,
    userModel: any,
    attributes: Map<any, any> | undefined,
    magazines?: Types.ObjectId[],
    posts?: Types.ObjectId[],
) {
    const USER = await userModel.create({
        _id: user_id,
        clerkId: 'TEST_B',
        email: 'TEST_B@email.com' + random(1, 100),
        username: 'TEST_B' + random(1, 100),
        name: 'TEST_B',
        lastName: 'TEST_B',
        finder: 'TEST_B',
        profilePhotoUrl: 'TEST_B.jpg',
        userType: "Person",
        userRelations: attributes?.get("userRelations") ?? [],
        kind: "Person",
        birthDate: "2000-01-01",
        gender: "M",
        subscriptions: attributes?.get("subscriptions") ?? [],
        notifications: [],
        magazines: magazines ?? [],
        posts: posts ?? [],
    });

    return USER
}

export { createPersonalUser }