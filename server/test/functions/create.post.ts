import { Types } from "mongoose";


class postTestRequest {
    _id?: Types.ObjectId;
    title?: string;
    description?: string;
    searchTitle?: string;
    author?: string;
    postType?: string;
    visibility?: {
        post: string;
        socialMedia: string;
    };
    price?: number;
    geoLocation?: {
        location: {
            type: string;
            coordinates: number[];
        };
        userSetted: boolean;
        description: string;
        ratio: number;
    };
    category?: Types.ObjectId[];
    createAt?: Date;
    postBehaviourType?: string;
    isActive?: boolean;
    comments?: any[];
    reactions?: any[];
    reviews?: any[];
    imagesUrls?: any[];
}



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