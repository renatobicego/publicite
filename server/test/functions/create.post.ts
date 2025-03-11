import { Types } from "mongoose";


class PostTestRequest {
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

class posTestGoodRequest extends PostTestRequest {
    year?: number;
    brand?: string;
    modelType?: string;
    reviews?: any[];
    condition?: string;

}

class postTestServiceRequest extends PostTestRequest {
    frequencyPrice?: string;
    imagesUrls?: string[];
    reviews?: any[];
}

class postTestPetitionRequest extends PostTestRequest {
    toPrice?: number;
    frequencyPrice?: string;
    petitionType?: string;
}






async function insertPostGood(postModel: any, postRequest: posTestGoodRequest) {
    const postGood = await postModel.create({
        _id: postRequest._id,
        title: postRequest.title ?? "title",
        description: postRequest.description ?? "description",
        searchTitle: postRequest.searchTitle ?? "title",
        author: postRequest.author,
        postType: "good",
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
        createAt: new Date(),
        postBehaviourType: postRequest.postBehaviourType ?? "libre",
        isActive: postRequest.isActive ?? true,
        comments: postRequest.comments ?? [],
        reactions: postRequest.reactions ?? [],
        reviews: postRequest.reviews ?? [],
        imagesUrls: postRequest.imagesUrls ?? [],
        year: postRequest.year ?? 2025,
        brand: postRequest.brand ?? "brand",
        modelType: postRequest.modelType ?? "new",
        condition: postRequest.condition ?? "new",
        endDate: postRequest.endDate ?? new Date(),

    });

    return postGood
}


async function inserPostService(postServiceModel: any, postRequest: postTestServiceRequest) {
    const postService = await postServiceModel.create({
        _id: postRequest._id,
        title: postRequest.title ?? "title",
        description: postRequest.description ?? "description",
        searchTitle: postRequest.searchTitle ?? "title",
        author: postRequest.author,
        postType: "good",
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
        createAt: new Date(),
        postBehaviourType: postRequest.postBehaviourType ?? "libre",
        isActive: postRequest.isActive ?? true,
        comments: postRequest.comments ?? [],
        reactions: postRequest.reactions ?? [],
        reviews: postRequest.reviews ?? [],
        imagesUrls: postRequest.imagesUrls ?? [],
        frequencyPrice: postRequest.frequencyPrice ?? "day",
    });

    return postService
}

async function insertPostPetition(postModel: any, postRequest: postTestPetitionRequest) {
    const postPetition = await postModel.create({
        _id: postRequest._id,
        title: postRequest.title ?? "title",
        description: postRequest.description ?? "description",
        searchTitle: postRequest.searchTitle ?? "title",
        author: postRequest.author,
        postType: "petition",
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
        createAt: new Date(),
        postBehaviourType: postRequest.postBehaviourType ?? "libre",
        isActive: postRequest.isActive ?? true,
        comments: postRequest.comments ?? [],
        reactions: postRequest.reactions ?? [],
        reviews: postRequest.reviews ?? [],
        imagesUrls: postRequest.imagesUrls ?? [],
        toPrice: postRequest.toPrice ?? 300,
        frequencyPrice: postRequest.frequencyPrice ?? "day",
        petitionType: postRequest.petitionType ?? "good",

    });

    return postPetition
}
export { insertPostGood, inserPostService, insertPostPetition }
