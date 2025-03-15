import { Connection, Types } from "mongoose";



interface PostTestRequest {
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
    postBehaviourType?: string;
    isActive?: boolean;
    comments?: any[];
    reactions?: any[];
    reviews?: any[];
    imagesUrls?: any[];
    endDate?: Date;
}


async function createTestingPost_e2e(postRequest: PostTestRequest, dbConnection: Connection) {
    postRequest = {
        _id: postRequest._id ?? new Types.ObjectId(),
        title: postRequest.title ?? "title",
        description: postRequest.description ?? "description",
        searchTitle: postRequest.searchTitle ?? "title",
        author: postRequest.author ?? "author",
        postType: postRequest.postType ?? "good",
        visibility: postRequest.visibility ?? {
            post: "public",
            socialMedia: "public"
        },
        price: postRequest.price ?? 300,
        geoLocation: postRequest.geoLocation ?? {
            location: {
                type: "Point",
                coordinates: [-73.935242, 40.73061]
            },
            userSetted: false,
            description: "descripcion",
            ratio: 0
        },
        category: postRequest.category ?? [new Types.ObjectId("63c0d4f9d8f8f8f8f8f8f8f8")],
        postBehaviourType: postRequest.postBehaviourType ?? "libre",
        isActive: postRequest.isActive ?? true,
        comments: postRequest.comments ?? [],
        reactions: postRequest.reactions ?? [],
        reviews: postRequest.reviews ?? [],
        imagesUrls: postRequest.imagesUrls ?? [],
        endDate: postRequest.endDate ?? new Date()
    }



    await dbConnection.collection('posts').insertOne(postRequest);
    return postRequest;
}

export default createTestingPost_e2e;