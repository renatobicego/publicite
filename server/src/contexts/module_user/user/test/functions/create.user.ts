import { Types } from "mongoose";

async function createPersonalUser(user_id: Types.ObjectId, userModel: any, attributes: Map<any, any>) {
    const USER = await userModel.create({
        _id: user_id,
        clerkId: 'TEST_B',
        email: 'TEST_B@email.com',
        username: 'TEST_B',
        name: 'TEST_B',
        lastName: 'TEST_B',
        finder: 'TEST_B',
        profilePhotoUrl: 'TEST_B.jpg',
        userType: 'business',
        userRelations: [],
        subscriptions: attributes.get("subscriptions")

    });

    return USER
}

export { createPersonalUser }