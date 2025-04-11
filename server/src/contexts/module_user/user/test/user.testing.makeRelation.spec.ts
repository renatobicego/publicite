import mongoose, { Model, Connection, Types } from "mongoose";
import { TestingModule } from "@nestjs/testing";
import { getModelToken } from '@nestjs/mongoose';


import mapModuleTesting from "./user.test.module";
import { UserService } from "../application/service/user.service";
import { IUser, UserModel } from '../infrastructure/schemas/user.schema';
import { UserRelationDocument, UserRelationModel } from "../infrastructure/schemas/user.relation.schema";
import SubscriptionModel, { SubscriptionDocument } from "src/contexts/module_webhook/mercadopago/infastructure/schemas/subscription.schema";
import SubscriptionPlanModel, { SubscriptionPlanDocument } from "src/contexts/module_webhook/mercadopago/infastructure/schemas/subscriptionPlan.schema";


describe('UserService - Make relation between two users', () => {
    let connection: Connection;
    let userService: UserService;
    let userRelationModel: Model<UserRelationDocument>
    let userModel: Model<IUser>;
    let subscriptionModel: Model<SubscriptionDocument>
    let subscriptionPlanModel: Model<SubscriptionPlanDocument>

    const relationAvailables = new Map([
        ["friends", "friends"],
        ["contacts", "contacts"],
        ["topfriends", "topfriends"],
    ])


    beforeAll(async () => {
        const moduleRef: TestingModule = await mapModuleTesting.get("make-relation")();
        userService = moduleRef.get<UserService>('UserServiceInterface');
        connection = mongoose.connection;
        userModel = moduleRef.get<Model<IUser>>(getModelToken(UserModel.modelName));
        userRelationModel = moduleRef.get<Model<UserRelationDocument>>(getModelToken(UserRelationModel.modelName));
        subscriptionModel = moduleRef.get<Model<SubscriptionDocument>>(getModelToken(SubscriptionModel.modelName));
        subscriptionPlanModel = moduleRef.get<Model<SubscriptionPlanDocument>>(getModelToken(SubscriptionPlanModel.modelName));
    });

    afterAll(async () => {
        await connection.close();

    });

    afterEach(async () => {
        await userModel.deleteMany({});
        await userRelationModel.deleteMany({});
        await subscriptionModel.deleteMany({});
        await subscriptionPlanModel.deleteMany({});
    });

    it('Create a relationship between  two users (friends)', async () => {
        const typeOfRelation = relationAvailables.get("friends");
        const USER_A_ID = new Types.ObjectId("66d2177dda11f93d8647cf3b")
        const USER_B_ID = new Types.ObjectId("66d2177dda11f93d8647cf3c")

        await userModel.create({
            _id: USER_A_ID,
            clerkId: 'TEST_A',
            email: 'TEST_At@email.com',
            username: 'TEST_A',
            name: 'TEST_A',
            lastName: 'TEST_A',
            finder: 'TEST_A',
            profilePhotoUrl: 'TEST_A.jpg',
            userType: 'person',
            userRelations: []
        });
        await userModel.create({
            _id: USER_B_ID,
            clerkId: 'TEST_B',
            email: 'TEST_B@email.com',
            username: 'TEST_B',
            name: 'TEST_B',
            lastName: 'TEST_B',
            finder: 'TEST_B',
            profilePhotoUrl: 'TEST_B.jpg',
            userType: 'business',
            userRelations: []
        });

        const backData = {
            userIdFrom: "66d2177dda11f93d8647cf3b",
            userIdTo: "66d2177dda11f93d8647cf3c"
        }



        const userRelationIdExpected = await userService.makeFriendRelationBetweenUsers(
            backData,
            typeOfRelation ?? "friends",
            null
        )
        let realation: any = await userRelationModel.find({ userA: USER_A_ID, userB: USER_B_ID });
        expect(realation.length).toBe(1);
        if (realation.length == 1) {
            realation = realation[0]
        }
        console.log("Verificacion creacion schema")
        expect(realation).toBeDefined();
        expect(realation?.userA).toEqual(USER_A_ID);
        expect(realation?.userB).toEqual(USER_B_ID);
        expect(realation?.typeRelationA).toBe(typeOfRelation);
        expect(realation?.typeRelationB).toBe(typeOfRelation);
        expect(realation?._id.toString()).toBe(userRelationIdExpected);


        const userA: any = await userModel.findOne({ _id: USER_A_ID }).select("userRelations").populate({ path: "userRelations", model: "UserRelation" });
        console.log("Verificacion de asociacion USER A")
        expect(userA).toBeDefined();
        expect(userA?.userRelations[0]._id.toString()).toBe(userRelationIdExpected);
        expect(userA?.userRelations[0].userA).toEqual(USER_A_ID);
        expect(userA?.userRelations[0].userB).toEqual(USER_B_ID);

        const userB: any = await userModel.findOne({ _id: USER_B_ID }).select("userRelations").populate({ path: "userRelations", model: "UserRelation" });

        console.log("Verificacion de asociacion USER B")
        expect(userB).toBeDefined();
        expect(userB?.userRelations[0]._id.toString()).toBe(userRelationIdExpected);
        expect(userB?.userRelations[0].userA).toEqual(USER_A_ID);
        expect(userA?.userRelations[0].userB).toEqual(USER_B_ID);



    });

    it('Create a relationship between  two users (contacts)', async () => {
        const typeOfRelation = relationAvailables.get("contacts");
        const USER_A_ID = new Types.ObjectId("66d2177dda11f93d8647cf3b")
        const USER_B_ID = new Types.ObjectId("66d2177dda11f93d8647cf3c")

        await userModel.create({
            _id: USER_A_ID,
            clerkId: 'TEST_A',
            email: 'TEST_At@email.com',
            username: 'TEST_A',
            name: 'TEST_A',
            lastName: 'TEST_A',
            finder: 'TEST_A',
            profilePhotoUrl: 'TEST_A.jpg',
            userType: 'person',
            userRelations: []
        });
        await userModel.create({
            _id: USER_B_ID,
            clerkId: 'TEST_B',
            email: 'TEST_B@email.com',
            username: 'TEST_B',
            name: 'TEST_B',
            lastName: 'TEST_B',
            finder: 'TEST_B',
            profilePhotoUrl: 'TEST_B.jpg',
            userType: 'business',
            userRelations: []
        });

        const backData = {
            userIdFrom: "66d2177dda11f93d8647cf3b",
            userIdTo: "66d2177dda11f93d8647cf3c"
        }



        const userRelationIdExpected = await userService.makeFriendRelationBetweenUsers(
            backData,
            typeOfRelation ?? "contacts",
            null
        )
        let realation: any = await userRelationModel.find({ userA: USER_A_ID, userB: USER_B_ID });
        console.log("Verificacion creacion schema")
        expect(realation).toBeDefined();
        expect(realation.length).toBe(1);
        if (realation.length == 1) {
            realation = realation[0]
        }
        expect(realation?.userA).toEqual(USER_A_ID);
        expect(realation?.userB).toEqual(USER_B_ID);
        expect(realation?.typeRelationA).toBe(typeOfRelation);
        expect(realation?.typeRelationB).toBe(typeOfRelation);
        expect(realation?._id.toString()).toBe(userRelationIdExpected);


        const userA: any = await userModel.findOne({ _id: USER_A_ID }).select("userRelations").populate({ path: "userRelations", model: "UserRelation" });
        console.log("Verificacion de asociacion USER A")
        expect(userA).toBeDefined();
        expect(userA?.userRelations[0]._id.toString()).toBe(userRelationIdExpected);
        expect(userA?.userRelations[0].userA).toEqual(USER_A_ID);
        expect(userA?.userRelations[0].userB).toEqual(USER_B_ID);

        const userB: any = await userModel.findOne({ _id: USER_B_ID }).select("userRelations").populate({ path: "userRelations", model: "UserRelation" });

        console.log("Verificacion de asociacion USER B")
        expect(userB).toBeDefined();
        expect(userB?.userRelations[0]._id.toString()).toBe(userRelationIdExpected);
        expect(userB?.userRelations[0].userA).toEqual(USER_A_ID);
        expect(userA?.userRelations[0].userB).toEqual(USER_B_ID);



    });

    it('Create a relationship between  two users (topfriends)', async () => {
        const typeOfRelation = relationAvailables.get("topfriends");
        const USER_A_ID = new Types.ObjectId("66d2177dda11f93d8647cf3b")
        const USER_B_ID = new Types.ObjectId("66d2177dda11f93d8647cf3c")

        await userModel.create({
            _id: USER_A_ID,
            clerkId: 'TEST_A',
            email: 'TEST_At@email.com',
            username: 'TEST_A',
            name: 'TEST_A',
            lastName: 'TEST_A',
            finder: 'TEST_A',
            profilePhotoUrl: 'TEST_A.jpg',
            userType: 'person',
            userRelations: []
        });
        await userModel.create({
            _id: USER_B_ID,
            clerkId: 'TEST_B',
            email: 'TEST_B@email.com',
            username: 'TEST_B',
            name: 'TEST_B',
            lastName: 'TEST_B',
            finder: 'TEST_B',
            profilePhotoUrl: 'TEST_B.jpg',
            userType: 'business',
            userRelations: []
        });

        const backData = {
            userIdFrom: "66d2177dda11f93d8647cf3b",
            userIdTo: "66d2177dda11f93d8647cf3c"
        }



        const userRelationIdExpected = await userService.makeFriendRelationBetweenUsers(
            backData,
            typeOfRelation ?? "topfriends",
            null
        )
        const realation: any = await userRelationModel.findOne({ userA: USER_A_ID, userB: USER_B_ID });
        console.log("Verificacion creacion schema")
        expect(realation).toBeDefined();
        expect(realation?.userA).toEqual(USER_A_ID);
        expect(realation?.userB).toEqual(USER_B_ID);
        expect(realation?.typeRelationA).toBe(typeOfRelation);
        expect(realation?.typeRelationB).toBe(typeOfRelation);
        expect(realation?._id.toString()).toBe(userRelationIdExpected);


        const userA: any = await userModel.findOne({ _id: USER_A_ID }).select("userRelations").populate({ path: "userRelations", model: "UserRelation" });
        console.log("Verificacion de asociacion USER A")
        expect(userA).toBeDefined();
        expect(userA?.userRelations[0]._id.toString()).toBe(userRelationIdExpected);
        expect(userA?.userRelations[0].userA).toEqual(USER_A_ID);
        expect(userA?.userRelations[0].userB).toEqual(USER_B_ID);

        const userB: any = await userModel.findOne({ _id: USER_B_ID }).select("userRelations").populate({ path: "userRelations", model: "UserRelation" });

        console.log("Verificacion de asociacion USER B")
        expect(userB).toBeDefined();
        expect(userB?.userRelations[0]._id.toString()).toBe(userRelationIdExpected);
        expect(userB?.userRelations[0].userA).toEqual(USER_A_ID);
        expect(userA?.userRelations[0].userB).toEqual(USER_B_ID);



    });


    it('Should throw an error if the relation type is not a valid enum', async () => {
        const typeOfRelation = "test";
        const USER_A_ID = new Types.ObjectId("66d2177dda11f93d8647cf3b");
        const USER_B_ID = new Types.ObjectId("66d2177dda11f93d8647cf3c");

        // Creación de los usuarios
        const USER_A = await userModel.create({
            _id: USER_A_ID,
            clerkId: 'TEST_A',
            email: 'TEST_At@email.com',
            username: 'TEST_A',
            name: 'TEST_A',
            lastName: 'TEST_A',
            finder: 'TEST_A',
            profilePhotoUrl: 'TEST_A.jpg',
            userType: 'person',
            userRelations: []
        });
        const USER_B = await userModel.create({
            _id: USER_B_ID,
            clerkId: 'TEST_B',
            email: 'TEST_B@email.com',
            username: 'TEST_B',
            name: 'TEST_B',
            lastName: 'TEST_B',
            finder: 'TEST_B',
            profilePhotoUrl: 'TEST_B.jpg',
            userType: 'business',
            userRelations: []
        });

        const backData = {
            userIdFrom: "66d2177dda11f93d8647cf3b",
            userIdTo: "66d2177dda11f93d8647cf3c"
        }

        console.log("verificacion de error ")
        await expect(userService.makeFriendRelationBetweenUsers(
            backData,
            typeOfRelation ?? "test",
            null
        )).rejects.toThrowError(new RegExp('validation failed',));


        console.log("verificacion de no creacion schema ")
        const realation: any = await userRelationModel.findOne({ userA: USER_A_ID, userB: USER_B_ID });
        expect(realation).toBeNull();

    });


    it('Create a relationship and push it to active relations (USER A INITIATES RELATION)', async () => {


        const typeOfRelation = relationAvailables.get("friends");
        const USER_A_ID = new Types.ObjectId("66d2177dda11f93d8647cf3b")
        const USER_B_ID = new Types.ObjectId("66d2177dda11f93d8647cf3c")

        await subscriptionPlanModel.create({
            _id: new Types.ObjectId("66d2177dda11f93d8647cf3d"),
            mpPreapprovalPlanId: "This is a free plan",
            isActive: true,
            reason: "Publicité Free",
            description: "Este plan es publicite free.",
            features: ["feature1", "feature2"],
            intervalTime: 7,
            price: 0,
            isFree: true,
            postsLibresCount: 1,
            postsAgendaCount: 1,
            maxContacts: 5
        });

        await subscriptionModel.create({
            _id: new Types.ObjectId("67ad4c4bdb9283528cea83b9"),
            mpPreapprovalId: "FREE SUBSCRIPTION",
            payerId: "FREE SUBSCRIPTION",
            status: "authorized",
            subscriptionPlan: new Types.ObjectId("66d2177dda11f93d8647cf3d"),
            startDate: "test",
            endDate: "test",
            external_reference: USER_A_ID.toString(),
            timeOfUpdate: "FREE SUBSCRIPTION",
            nextPaymentDate: "FREE SUBSCRIPTION",
            paymentMethodId: "FREE SUBSCRIPTION",
            cardId: "FREE SUBSCRIPTION",
            __v: 0
        });



        await userModel.create({
            _id: USER_A_ID,
            clerkId: 'TEST_A',
            email: 'TEST_At@email.com',
            username: 'TEST_A',
            name: 'TEST_A',
            lastName: 'TEST_A',
            finder: 'TEST_A',
            profilePhotoUrl: 'TEST_A.jpg',
            userType: 'person',
            userRelations: [],
            subscriptions: new Types.ObjectId("67ad4c4bdb9283528cea83b9"),
            activeRelations: []

        });

        await userModel.create({
            _id: USER_B_ID,
            clerkId: 'TEST_B',
            email: 'TEST_B@email.com',
            username: 'TEST_B',
            name: 'TEST_B',
            lastName: 'TEST_B',
            finder: 'TEST_B',
            profilePhotoUrl: 'TEST_B.jpg',
            userType: 'business',
            userRelations: [],
            subscriptions: new Types.ObjectId("67ad4c4bdb9283528cea83b9"),
            activeRelations: []
        });



        const backData = {
            userIdFrom: USER_B_ID.toString(),
            userIdTo: USER_A_ID.toString() // Es el que originalmente envio la solicitud
        }



        await userService.makeFriendRelationBetweenUsers(
            backData,
            typeOfRelation ?? "friends",
            null
        )


        const user: any = await userModel.findOne({ _id: USER_A_ID }).select("activeRelations");
        console.log("Verificacion de active relations USER A")
        expect(user).toBeDefined();
        expect(user?.activeRelations.length).toBe(1);
        console.log("Verificacion de contactos max segun plan")
        const maxContacts: number = await userService.getLimitContactsFromUserByUserId(USER_A_ID.toString());
        expect(5).toBe(maxContacts);


    })

    it('Create a relationship and push it to active relations (USER A INITIATES RELATION)', async () => {


        const typeOfRelation = relationAvailables.get("friends");
        const USER_A_ID = new Types.ObjectId("66d2177dda11f93d8647cf3b")
        const USER_B_ID = new Types.ObjectId("66d2177dda11f93d8647cf3c")

        await subscriptionPlanModel.create({
            _id: new Types.ObjectId("66d2177dda11f93d8647cf3d"),
            mpPreapprovalPlanId: "This is a free plan",
            isActive: true,
            reason: "Publicité Free",
            description: "Este plan es publicite free.",
            features: ["feature1", "feature2"],
            intervalTime: 7,
            price: 0,
            isFree: true,
            postsLibresCount: 1,
            postsAgendaCount: 1,
            maxContacts: 5
        });

        await subscriptionModel.create({
            _id: new Types.ObjectId("67ad4c4bdb9283528cea83b9"),
            mpPreapprovalId: "FREE SUBSCRIPTION",
            payerId: "FREE SUBSCRIPTION",
            status: "authorized",
            subscriptionPlan: new Types.ObjectId("66d2177dda11f93d8647cf3d"),
            startDate: "test",
            endDate: "test",
            external_reference: USER_A_ID.toString(),
            timeOfUpdate: "FREE SUBSCRIPTION",
            nextPaymentDate: "FREE SUBSCRIPTION",
            paymentMethodId: "FREE SUBSCRIPTION",
            cardId: "FREE SUBSCRIPTION",
            __v: 0
        });



        await userModel.create({
            _id: USER_A_ID,
            clerkId: 'TEST_A',
            email: 'TEST_At@email.com',
            username: 'TEST_A',
            name: 'TEST_A',
            lastName: 'TEST_A',
            finder: 'TEST_A',
            profilePhotoUrl: 'TEST_A.jpg',
            userType: 'person',
            userRelations: [],
            subscriptions: new Types.ObjectId("67ad4c4bdb9283528cea83b9"),
            activeRelations: []

        });

        await userModel.create({
            _id: USER_B_ID,
            clerkId: 'TEST_B',
            email: 'TEST_B@email.com',
            username: 'TEST_B',
            name: 'TEST_B',
            lastName: 'TEST_B',
            finder: 'TEST_B',
            profilePhotoUrl: 'TEST_B.jpg',
            userType: 'business',
            userRelations: [],
            subscriptions: new Types.ObjectId("67ad4c4bdb9283528cea83b9"),
            activeRelations: []
        });



        const backData = {
            userIdFrom: USER_B_ID.toString(),
            userIdTo: USER_A_ID.toString() // Es el que originalmente envio la solicitud
        }



        await userService.makeFriendRelationBetweenUsers(
            backData,
            typeOfRelation ?? "friends",
            null
        )


        const user: any = await userModel.findOne({ _id: USER_A_ID }).select("activeRelations");
        console.log("Verificacion de active relations USER A")
        expect(user).toBeDefined();
        expect(user?.activeRelations.length).toBe(1);
        console.log("Verificacion de contactos max segun plan")
        const maxContacts: number = await userService.getLimitContactsFromUserByUserId(USER_A_ID.toString());
        expect(5).toBe(maxContacts);


    })


    it('Create relationship and check if the new one is added to active relations (user with two plan of subscription)', async () => {


        const typeOfRelation = relationAvailables.get("contacts");
        const USER_A_ID = new Types.ObjectId("66d2177dda11f93d8647cf3b")
        const USER_B_ID = new Types.ObjectId("66d2177dda11f93d8647cf3c")
        let userRelationArray = []

        await subscriptionPlanModel.create({
            _id: new Types.ObjectId("66d2177dda11f93d8647cf3d"),
            mpPreapprovalPlanId: "This is a free plan",
            isActive: true,
            reason: "Publicité Free",
            description: "Este plan es publicite free.",
            features: ["feature1", "feature2"],
            intervalTime: 7,
            price: 0,
            isFree: true,
            postsLibresCount: 1,
            postsAgendaCount: 1,
            maxContacts: 5
        });

        await subscriptionModel.create({
            _id: new Types.ObjectId("67ad4c4bdb9283528cea83b9"),
            mpPreapprovalId: "TEST",
            payerId: "FREE SUBSCRIPTION",
            status: "authorized",
            subscriptionPlan: new Types.ObjectId("66d2177dda11f93d8647cf3d"),
            startDate: "test",
            endDate: "test",
            external_reference: USER_A_ID.toString(),
            timeOfUpdate: "FREE SUBSCRIPTION",
            nextPaymentDate: "FREE SUBSCRIPTION",
            paymentMethodId: "FREE SUBSCRIPTION",
            cardId: "FREE SUBSCRIPTION",
            __v: 0
        });


        await subscriptionPlanModel.create({
            _id: new Types.ObjectId("66d2177dda11f93d8647cf3c"),
            mpPreapprovalPlanId: "TEST2",
            isActive: true,
            reason: "Publicité Free",
            description: "Este plan es publicite free.",
            features: ["feature1", "feature2"],
            intervalTime: 7,
            price: 0,
            isFree: true,
            postsLibresCount: 1,
            postsAgendaCount: 1,
            maxContacts: 5
        });

        await subscriptionModel.create({
            _id: new Types.ObjectId("67ad4c4bdb9283528cea83b2"),
            mpPreapprovalId: "TEST33",
            payerId: "FREE SUBSCRIPTION",
            status: "authorized",
            subscriptionPlan: new Types.ObjectId("66d2177dda11f93d8647cf3c"),
            startDate: "test",
            endDate: "test",
            external_reference: USER_A_ID.toString(),
            timeOfUpdate: "FREE SUBSCRIPTION",
            nextPaymentDate: "FREE SUBSCRIPTION",
            paymentMethodId: "FREE SUBSCRIPTION",
            cardId: "FREE SUBSCRIPTION",
            __v: 0
        });

        for (let i = 0; i < 8; i++) {
            let id = "66d2177dda11f93d8647cf3" + i
            await userRelationModel.create(
                {
                    _id: new Types.ObjectId(id),
                    userA: new Types.ObjectId(USER_A_ID),
                    userB: new Types.ObjectId(),
                    typeRelationA: typeOfRelation,
                    typeRelationB: typeOfRelation
                }
            )
            userRelationArray.push(new Types.ObjectId(id))
        }


        await userModel.create({
            _id: USER_A_ID,
            clerkId: 'TEST_A',
            email: 'TEST_At@email.com',
            username: 'TEST_A',
            name: 'TEST_A',
            lastName: 'TEST_A',
            finder: 'TEST_A',
            profilePhotoUrl: 'TEST_A.jpg',
            userType: 'person',
            userRelations: [],
            subscriptions: [
                new Types.ObjectId("67ad4c4bdb9283528cea83b9"),
                new Types.ObjectId("67ad4c4bdb9283528cea83b2")

            ],
            activeRelations: userRelationArray

        });

        await userModel.create({
            _id: USER_B_ID,
            clerkId: 'TEST_B',
            email: 'TEST_B@email.com',
            username: 'TEST_B',
            name: 'TEST_B',
            lastName: 'TEST_B',
            finder: 'TEST_B',
            profilePhotoUrl: 'TEST_B.jpg',
            userType: 'business',
            userRelations: [],
        });



        const backData = {
            userIdFrom: USER_B_ID.toString(),
            userIdTo: USER_A_ID.toString() // Es el que originalmente envio la solicitud
        }



        await userService.makeFriendRelationBetweenUsers(
            backData,
            typeOfRelation ?? "friends",
            null
        )



        const user: any = await userModel.findOne({ _id: USER_A_ID }).select("activeRelations");
        console.log("Verificacion de active relations USER B")
        expect(user).toBeDefined();
        expect(user?.activeRelations.length).toBe(9);
        console.log("Verificacion de contactos max segun plan")
        const maxContacts: number = await userService.getLimitContactsFromUserByUserId(USER_A_ID.toString());
        expect(10).toBe(maxContacts);


    })

    it('Create a relationship between two users and two inactive plans', async () => {


        const typeOfRelation = relationAvailables.get("contacts");
        const USER_A_ID = new Types.ObjectId("66d2177dda11f93d8647cf3b")
        const USER_B_ID = new Types.ObjectId("66d2177dda11f93d8647cf3c")
        let userRelationArray = []

        await subscriptionPlanModel.create({
            _id: new Types.ObjectId("66d2177dda11f93d8647cf3d"),
            mpPreapprovalPlanId: "This is a free plan",
            isActive: true,
            reason: "Publicité Free",
            description: "Este plan es publicite free.",
            features: ["feature1", "feature2"],
            intervalTime: 7,
            price: 0,
            isFree: true,
            postsLibresCount: 1,
            postsAgendaCount: 1,
            maxContacts: 5
        });

        await subscriptionModel.create({
            _id: new Types.ObjectId("67ad4c4bdb9283528cea83b9"),
            mpPreapprovalId: "TEST",
            payerId: "FREE SUBSCRIPTION",
            status: "paused",
            subscriptionPlan: new Types.ObjectId("66d2177dda11f93d8647cf3d"),
            startDate: "test",
            endDate: "test",
            external_reference: USER_A_ID.toString(),
            timeOfUpdate: "FREE SUBSCRIPTION",
            nextPaymentDate: "FREE SUBSCRIPTION",
            paymentMethodId: "FREE SUBSCRIPTION",
            cardId: "FREE SUBSCRIPTION",
            __v: 0
        });


        await subscriptionPlanModel.create({
            _id: new Types.ObjectId("66d2177dda11f93d8647cf3c"),
            mpPreapprovalPlanId: "TEST2",
            isActive: true,
            reason: "Publicité Free",
            description: "Este plan es publicite free.",
            features: ["feature1", "feature2"],
            intervalTime: 7,
            price: 0,
            isFree: true,
            postsLibresCount: 1,
            postsAgendaCount: 1,
            maxContacts: 5
        });

        await subscriptionModel.create({
            _id: new Types.ObjectId("67ad4c4bdb9283528cea83b2"),
            mpPreapprovalId: "TEST33",
            payerId: "FREE SUBSCRIPTION",
            status: "paused",
            subscriptionPlan: new Types.ObjectId("66d2177dda11f93d8647cf3c"),
            startDate: "test",
            endDate: "test",
            external_reference: USER_A_ID.toString(),
            timeOfUpdate: "FREE SUBSCRIPTION",
            nextPaymentDate: "FREE SUBSCRIPTION",
            paymentMethodId: "FREE SUBSCRIPTION",
            cardId: "FREE SUBSCRIPTION",
            __v: 0
        });


        await userModel.create({
            _id: USER_A_ID,
            clerkId: 'TEST_A',
            email: 'TEST_At@email.com',
            username: 'TEST_A',
            name: 'TEST_A',
            lastName: 'TEST_A',
            finder: 'TEST_A',
            profilePhotoUrl: 'TEST_A.jpg',
            userType: 'person',
            userRelations: [],
            subscriptions: [
                new Types.ObjectId("67ad4c4bdb9283528cea83b9"),
                new Types.ObjectId("67ad4c4bdb9283528cea83b2")

            ],
            activeRelations: []

        });

        await userModel.create({
            _id: USER_B_ID,
            clerkId: 'TEST_B',
            email: 'TEST_B@email.com',
            username: 'TEST_B',
            name: 'TEST_B',
            lastName: 'TEST_B',
            finder: 'TEST_B',
            profilePhotoUrl: 'TEST_B.jpg',
            userType: 'business',
            userRelations: [],
        });



        const backData = {
            userIdFrom: USER_B_ID.toString(),
            userIdTo: USER_A_ID.toString() // Es el que originalmente envio la solicitud
        }



        await userService.makeFriendRelationBetweenUsers(
            backData,
            typeOfRelation ?? "friends",
            null
        )



        const user: any = await userModel.findOne({ _id: USER_A_ID }).select("activeRelations");
        console.log("Verificacion de active relations USER B")
        expect(user).toBeDefined();
        expect(user?.activeRelations.length).toBe(0);
        console.log("Verificacion de contactos max segun plan")
        const maxContacts: number = await userService.getLimitContactsFromUserByUserId(USER_A_ID.toString());
        expect(0).toBe(maxContacts);


    })


    it('Create a relationship and verify that it is not added to active relations because the active relations list is full', async () => {


        const typeOfRelation = relationAvailables.get("contacts");
        const USER_A_ID = new Types.ObjectId("66d2177dda11f93d8647cf3b")
        const USER_B_ID = new Types.ObjectId("66d2177dda11f93d8647cf3c")
        let userRelationArray = []

        await subscriptionPlanModel.create({
            _id: new Types.ObjectId("66d2177dda11f93d8647cf3d"),
            mpPreapprovalPlanId: "This is a free plan",
            isActive: true,
            reason: "Publicité Free",
            description: "Este plan es publicite free.",
            features: ["feature1", "feature2"],
            intervalTime: 7,
            price: 0,
            isFree: true,
            postsLibresCount: 1,
            postsAgendaCount: 1,
            maxContacts: 5
        });

        await subscriptionModel.create({
            _id: new Types.ObjectId("67ad4c4bdb9283528cea83b9"),
            mpPreapprovalId: "FREE SUBSCRIPTION",
            payerId: "FREE SUBSCRIPTION",
            status: "authorized",
            subscriptionPlan: new Types.ObjectId("66d2177dda11f93d8647cf3d"),
            startDate: "test",
            endDate: "test",
            external_reference: USER_A_ID.toString(),
            timeOfUpdate: "FREE SUBSCRIPTION",
            nextPaymentDate: "FREE SUBSCRIPTION",
            paymentMethodId: "FREE SUBSCRIPTION",
            cardId: "FREE SUBSCRIPTION",
            __v: 0
        });

        for (let i = 0; i < 7; i++) {
            let id = "66d2177dda11f93d8647cf3" + i
            await userRelationModel.create(
                {
                    _id: new Types.ObjectId(id),
                    userA: new Types.ObjectId(),
                    userB: new Types.ObjectId(),
                    typeRelationA: typeOfRelation,
                    typeRelationB: typeOfRelation
                }
            )
            userRelationArray.push(new Types.ObjectId(id))
        }


        await userModel.create({
            _id: USER_A_ID,
            clerkId: 'TEST_A',
            email: 'TEST_At@email.com',
            username: 'TEST_A',
            name: 'TEST_A',
            lastName: 'TEST_A',
            finder: 'TEST_A',
            profilePhotoUrl: 'TEST_A.jpg',
            userType: 'person',
            userRelations: [],
            subscriptions: new Types.ObjectId("67ad4c4bdb9283528cea83b9"),
            activeRelations: userRelationArray

        });

        await userModel.create({
            _id: USER_B_ID,
            clerkId: 'TEST_B',
            email: 'TEST_B@email.com',
            username: 'TEST_B',
            name: 'TEST_B',
            lastName: 'TEST_B',
            finder: 'TEST_B',
            profilePhotoUrl: 'TEST_B.jpg',
            userType: 'business',
            userRelations: [],
        });



        const backData = {
            userIdFrom: USER_B_ID.toString(),
            userIdTo: USER_A_ID.toString() // Es el que originalmente envio la solicitud
        }



        await userService.makeFriendRelationBetweenUsers(
            backData,
            typeOfRelation ?? "friends",
            null
        )



        const user: any = await userModel.findOne({ _id: USER_A_ID }).select("activeRelations");
        console.log("Verificacion de active relations USER B")
        expect(user).toBeDefined();
        expect(user?.activeRelations.length).toBe(7);
        console.log("Verificacion de contactos max segun plan")
        const maxContacts: number = await userService.getLimitContactsFromUserByUserId(USER_A_ID.toString());
        expect(5).toBe(maxContacts);


    })



    

})// end
