import mongoose, { Connection, Model, Types } from "mongoose";
import { TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";


import mapModuleTesting from "./post.test.module";
import { PostService } from "../post/application/service/post.service";
import { IPostGood } from "../post/infraestructure/schemas/post-types-schemas/post.good.schema";
import { IPostPetition } from "../post/infraestructure/schemas/post-types-schemas/post.petition.schema";
import { IPostService } from "../post/infraestructure/schemas/post-types-schemas/post.service.schema";
import { createPersonalUser } from "../../../../test/functions/create.user";
import { IUser } from "src/contexts/module_user/user/infrastructure/schemas/user.schema";
import { createPlanOfSubscription, createSubscriptionForUser } from "../../../../test/functions/create.planAndSub";
import SubscriptionModel, { SubscriptionDocument } from "src/contexts/module_webhook/mercadopago/infastructure/schemas/subscription.schema";
import SubscriptionPlanModel, { SubscriptionPlanDocument } from "src/contexts/module_webhook/mercadopago/infastructure/schemas/subscriptionPlan.schema";
import { BadRequestException } from "@nestjs/common";
import { PostRepository } from "../post/infraestructure/repository/post.repository";

enum PostBehaviourType {
    libre = 'libre',
    agenda = 'agenda',
}
enum Visibility {
    public = 'public',
    registered = 'registered',
    contacts = 'contacts',
    friends = 'friends',
    topfriends = 'topfriends',
}
enum Visibility_Of_Social_Media {
    public = 'public',
    registered = 'registered',
}
enum PostType {
    good = 'good',
    service = 'service',
    petition = 'petition',
}

class PostRequest_testing {
    title: string;
    author: string;
    postType: PostType;
    description: string;
    visibility: {
        post: Visibility,
        socialMedia: Visibility_Of_Social_Media
    };
    price: number;
    geoLocation: {
        location: {
            type: string;
            coordinates: number[]
        },
        userSetted: boolean;
        description: string;
        ratio: number;
    };
    category: Types.ObjectId[];
    attachedFiles: [
        {
            url: string;
            label: string;
        },
    ]
    createAt: string;
    postBehaviourType: PostBehaviourType;
}


class PostGoodRequest_testing extends PostRequest_testing {
    imagesUrls: string[];
    year: number;
    brand: string;
    modelType: string;
    condition: string;
}


class PostServiceRequest_testing extends PostRequest_testing {
    frequencyPrice: string;
}

class PostPetitionRequest_testing extends PostRequest_testing {
    toPrice: number;
    petitionType: string;
}



describe('Post Service Testing - Create post ', () => {
    let connection: Connection;
    let postService: PostService;
    let postRepository: PostRepository;

    let postServiceModel: Model<IPostService>;
    let postGoodModel: Model<IPostGood>;
    let postPetitionModel: Model<IPostPetition>;
    let userModel: Model<IUser>;
    let subscriptionPlanModel: Model<SubscriptionPlanDocument>
    let subscriptionModel: Model<SubscriptionDocument>


    const userId = new Types.ObjectId("66c49508e80296e90ec637d7");
    const subscriptionPlanId_2 = new Types.ObjectId("66c49508e80296e90ec637d7");
    const subscriptionId_2 = new Types.ObjectId("66c49508e80296e90ec637d6");
    beforeAll(async () => {
        connection = mongoose.connection;
        const moduleRef: TestingModule = await mapModuleTesting.get("post")();
        postService = moduleRef.get<PostService>('PostServiceInterface');
        postServiceModel = moduleRef.get<Model<IPostService>>('PostServiceModel');
        postGoodModel = moduleRef.get<Model<IPostGood>>('PostGoodModel');
        postPetitionModel = moduleRef.get<Model<IPostPetition>>('PostPetitionModel');
        userModel = moduleRef.get<Model<IUser>>('UserModel');
        subscriptionPlanModel = moduleRef.get<Model<SubscriptionPlanDocument>>(getModelToken(SubscriptionPlanModel.modelName));
        subscriptionModel = moduleRef.get<Model<SubscriptionDocument>>(getModelToken(SubscriptionModel.modelName));
        postRepository = moduleRef.get<PostRepository>('PostRepositoryInterface');


        await createPlanOfSubscription(
            subscriptionPlanId_2,
            subscriptionPlanModel,
            40,
            40,
            40,
            "MP_PREAPPROVAL_ID_xx1"
        )

        await createSubscriptionForUser(
            subscriptionId_2,
            userId.toString(),
            subscriptionPlanId_2,
            subscriptionModel,
            "MP_PREAPPROVAL_ID_xx1"
        )
        await createPersonalUser(userModel, { _id: userId, subscriptions: [subscriptionId_2] })
    })



    afterAll(async () => {
        await userModel.deleteMany({});
        await subscriptionModel.deleteMany({});
        await subscriptionPlanModel.deleteMany({});
        await postServiceModel.deleteMany({});
        await postGoodModel.deleteMany({});
        await postPetitionModel.deleteMany({});
        await connection.close();
    })
    it('Create a new Good post', async () => {

        const postGoodRequest: PostGoodRequest_testing = {
            title: "Post de prueba",
            author: userId.toString(),
            postType: PostType.good,
            description: "Descripción del producto",
            visibility: {
                post: Visibility.public,
                socialMedia: Visibility_Of_Social_Media.public,
            },
            price: 100,
            geoLocation: {
                location: {
                    type: "Point",
                    coordinates: [-73.935242, 40.73061], // Nueva York (ejemplo)
                },
                userSetted: true,
                description: "Ubicación de prueba",
                ratio: 10,
            },
            category: [new Types.ObjectId()],
            attachedFiles: [
                { url: "https://example.com/image1.jpg", label: "Foto 1" },
            ],
            createAt: new Date().toISOString(),
            postBehaviourType: PostBehaviourType.libre,
            imagesUrls: ["https://example.com/image1.jpg"],
            year: 2022,
            brand: "MarcaX",
            modelType: "ModeloY",
            condition: "Nuevo",
        };

        await postService.create(postGoodRequest as any);
        const postCreated = await postGoodModel.findOne({ title: postGoodRequest.title });
        expect(postCreated).toBeDefined();
        expect(postCreated?.title).toBe(postGoodRequest.title);
        expect(postCreated?.author).toBe(postGoodRequest.author);
        expect(postCreated?.postType).toBe(postGoodRequest.postType);
        expect(postCreated?.description).toBe(postGoodRequest.description);
        expect(postCreated?.visibility.post).toBe(postGoodRequest.visibility.post);
        expect(postCreated?.visibility.socialMedia).toBe(postGoodRequest.visibility.socialMedia);
        expect(postCreated?.price).toBe(postGoodRequest.price);
        expect(postCreated?.geoLocation.location.coordinates[0]).toBe(postGoodRequest.geoLocation.location.coordinates[0]);
        expect(postCreated?.geoLocation.location.coordinates[1]).toBe(postGoodRequest.geoLocation.location.coordinates[1]);
        expect(postCreated?.geoLocation.userSetted).toBe(postGoodRequest.geoLocation.userSetted);
        expect(postCreated?.geoLocation.description).toBe(postGoodRequest.geoLocation.description);
        expect(postCreated?.geoLocation.ratio).toBe(postGoodRequest.geoLocation.ratio);
        expect(postCreated?.category[0]).toEqual(postGoodRequest.category[0]);
        expect(postCreated?.attachedFiles[0].url).toEqual(postGoodRequest.attachedFiles[0].url);
        expect(postCreated?.attachedFiles[0].label).toEqual(postGoodRequest.attachedFiles[0].label);

        console.log("Verify if post was asociated to user");
        const user = await userModel.findById(postCreated?.author);
        expect(user!.posts[0]).toEqual(postCreated!._id);


    })

    it('Create a new Petition post', async () => {
        const postPetitionRequest: PostPetitionRequest_testing = {
            title: "Petición de prueba",
            author: userId.toString(),
            postType: PostType.petition,
            description: "Descripción de la petición",
            visibility: {
                post: Visibility.public,
                socialMedia: Visibility_Of_Social_Media.public,
            },
            price: 50,
            toPrice: 100,
            petitionType: "service",
            geoLocation: {
                location: {
                    type: "Point",
                    coordinates: [-73.935242, 40.73061],
                },
                userSetted: true,
                description: "Ubicación de prueba",
                ratio: 10,
            },
            category: [new Types.ObjectId()],
            attachedFiles: [
                { url: "https://example.com/image2.jpg", label: "Documento" },
            ],
            createAt: new Date().toISOString(),
            postBehaviourType: PostBehaviourType.agenda,
        };

        await postService.create(postPetitionRequest as any);
        const postCreated = await postPetitionModel.findOne({ title: postPetitionRequest.title });
        expect(postCreated).toBeDefined();
        expect(postCreated?.title).toBe(postPetitionRequest.title);
        expect(postCreated?.author).toBe(postPetitionRequest.author);
        expect(postCreated?.petitionType).toBe(postPetitionRequest.petitionType);
        expect(postCreated?.toPrice).toBe(postPetitionRequest.toPrice);
        console.log("Verify if post was associated to user");
        const user = await userModel.findById(postCreated?.author);
        expect(user!.posts[1]).toEqual(postCreated!._id);
    });

    it('Create a new Service post', async () => {
        const postServiceRequest: PostServiceRequest_testing = {
            title: "Servicio de prueba",
            author: userId.toString(),
            postType: PostType.service,
            description: "Descripción del servicio",
            visibility: {
                post: Visibility.public,
                socialMedia: Visibility_Of_Social_Media.public,
            },
            price: 200,
            frequencyPrice: "week",
            geoLocation: {
                location: {
                    type: "Point",
                    coordinates: [-73.935242, 40.73061],
                },
                userSetted: true,
                description: "Ubicación de prueba",
                ratio: 10,
            },
            category: [new Types.ObjectId()],
            attachedFiles: [
                { url: "https://example.com/image3.jpg", label: "Imagen de servicio" },
            ],
            createAt: new Date().toISOString(),
            postBehaviourType: PostBehaviourType.libre,
        };

        await postService.create(postServiceRequest as any);
        const postCreated = await postServiceModel.findOne({ title: postServiceRequest.title });
        expect(postCreated).toBeDefined();
        expect(postCreated?.title).toBe(postServiceRequest.title);
        expect(postCreated?.author).toBe(postServiceRequest.author);
        expect(postCreated?.frequencyPrice).toBe(postServiceRequest.frequencyPrice);
        console.log("Verify if post was associated to user");
        const user = await userModel.findById(postCreated?.author);
        expect(user!.posts[2]).toEqual(postCreated!._id);
    });


    it('Create a new post when user dont have a subscription or not have a space in the plan, should return error and the post should not be created', async () => {

        await subscriptionPlanModel.updateOne({ _id: subscriptionPlanId_2 }, { $set: { postsLibresCount: 0, postsAgendaCount: 0 } });
        const postGoodRequest: PostGoodRequest_testing = {
            title: "Post de prueba 123",
            author: userId.toString(),
            postType: PostType.good,
            description: "Descripción del producto",
            visibility: {
                post: Visibility.public,
                socialMedia: Visibility_Of_Social_Media.public,
            },
            price: 100,
            geoLocation: {
                location: {
                    type: "Point",
                    coordinates: [-73.935242, 40.73061],
                },
                userSetted: true,
                description: "Ubicación de prueba",
                ratio: 10,
            },
            category: [new Types.ObjectId()],
            attachedFiles: [
                { url: "https://example.com/image1.jpg", label: "Foto 1" },
            ],
            createAt: new Date().toISOString(),
            postBehaviourType: PostBehaviourType.libre,
            imagesUrls: ["https://example.com/image1.jpg"],
            year: 2022,
            brand: "MarcaX",
            modelType: "ModeloY",
            condition: "Nuevo",
        };


        await expect(postService.create(postGoodRequest as any)).rejects.toThrow(BadRequestException);
        const post = await postServiceModel.findOne({ title: postGoodRequest.title });
        expect(post).toBeNull();


    })

    it('Create a new post without postType, should return Bad Request error', async () => {
        const postGoodRequest = {
            title: "Post de prueba xd",
            author: userId.toString(),
            description: "Descripción del producto",
            visibility: {
                post: Visibility.public,
                socialMedia: Visibility_Of_Social_Media.public,
            },
            price: 100,
            geoLocation: {
                location: {
                    type: "Point",
                    coordinates: [-73.935242, 40.73061],
                },
                userSetted: true,
                description: "Ubicación de prueba",
                ratio: 10,
            },
            category: [new Types.ObjectId()],
            attachedFiles: [
                { url: "https://example.com/image1.jpg", label: "Foto 1" },
            ],
            createAt: new Date().toISOString(),
            postBehaviourType: PostBehaviourType.libre,
            imagesUrls: ["https://example.com/image1.jpg"],
            year: 2022,
            brand: "MarcaX",
            modelType: "ModeloY",
            condition: "Nuevo",
        };


        await expect(postService.create(postGoodRequest as any)).rejects.toThrow(BadRequestException);
        const post = await postServiceModel.findOne({ title: postGoodRequest.title });
        expect(post).toBeNull();


    })


    it('Error in postRepository when create a new post, should return error and the post should not be created', async () => {
        jest.spyOn(postRepository, 'create').mockResolvedValue(null)
        const postGoodRequest = {
            title: "Post de prueba",
            author: userId.toString(),
            description: "Descripción del producto",
            visibility: {
                post: Visibility.public,
                socialMedia: Visibility_Of_Social_Media.public,
            },
            price: 100,
            geoLocation: {
                location: {
                    type: "Point",
                    coordinates: [-73.935242, 40.73061],
                },
                userSetted: true,
                description: "Ubicación de prueba",
                ratio: 10,
            },
            category: [new Types.ObjectId()],
            attachedFiles: [
                { url: "https://example.com/image1.jpg", label: "Foto 1" },
            ],
            createAt: new Date().toISOString(),
            postBehaviourType: PostBehaviourType.libre,
            imagesUrls: ["https://example.com/image1.jpg"],
            year: 2022,
            brand: "MarcaX",
            modelType: "ModeloY",
            condition: "Nuevo",
        };


        await expect(postService.create(postGoodRequest as any)).rejects.toThrow(Error);
        const post = await postServiceModel.findOne({ title: postGoodRequest.title });
        expect(post).toBeNull();

        


    })
})