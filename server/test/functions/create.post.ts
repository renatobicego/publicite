import { Types } from "mongoose";

async function createPostGood(post_id: Types.ObjectId, postModel: any, author: string, visibility: string) {
    const POST = await postModel.create({
        _id: post_id,
        title: "title",
        description: "description",
        searchTitle: "title",
        author: author,
        postType: "good",
        visibility: {
            post: visibility,
            socialMedia: "public"
        },
        price: 300,
        geoLocation: {
            location: {
                type: "Point",
                coordinates: [-73.935242, 40.73061]
            },
            userSetted: false,
            description: "descripcion",
            ratio: 0
        },
        category: [new Types.ObjectId("63c0d4f9d8f8f8f8f8f8f8f8")],
        createAt: new Date(),
        postBehaviourType: "libre",
        isActive: true,
        comments: [],
        reactions: [],
        reviews: [],
        imagesUrls: [],

    });

    return POST
}

export { createPostGood }