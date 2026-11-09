import mongoose, { Connection, Model, Types } from "mongoose";
import { TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";

import mapModuleTesting from "./post.test.module";
import { PostService } from "../post/application/service/post.service";
import { IPostGood } from "../post/infraestructure/schemas/post-types-schemas/post.good.schema";
import { createPersonalUser } from "../../../../test/functions_unit_testing/user/create.user";
import { IUser } from "src/contexts/module_user/user/infrastructure/schemas/user.schema";
import {
    createPlanOfSubscription,
    createSubscriptionForUser,
} from "../../../../test/functions_unit_testing/plans/create.planAndSub";
import SubscriptionModel, { SubscriptionDocument } from "src/contexts/module_webhook/mercadopago/infastructure/schemas/subscription.schema";
import SubscriptionPlanModel, { SubscriptionPlanDocument } from "src/contexts/module_webhook/mercadopago/infastructure/schemas/subscriptionPlan.schema";

/**
 * Las fotos y videos de los anuncios suman al almacenamiento del plan (el mismo
 * cupo que los blogs de Mis Producciones). El plan de prueba no define
 * `storageBytesLimit`, así que rige el piso gratuito, que acá se baja a 1000 B.
 */
describe("Post Service Testing - Almacenamiento de fotos y videos", () => {
    let connection: Connection;
    let postService: PostService;
    let postGoodModel: Model<IPostGood>;
    let userModel: Model<IUser>;
    let subscriptionPlanModel: Model<SubscriptionPlanDocument>;
    let subscriptionModel: Model<SubscriptionDocument>;

    const userId = new Types.ObjectId();
    const planId = new Types.ObjectId();
    const subscriptionId = new Types.ObjectId();
    const previousEnv = {
        enabled: process.env.PRODUCTION_STORAGE_LIMIT_ENABLED,
        free: process.env.PRODUCTION_FREE_STORAGE_BYTES,
    };

    const goodRequest = (title: string, images: { key: string; sizeBytes: number }[]) => ({
        title,
        author: userId.toString(),
        postType: "good",
        description: "Descripción",
        visibility: { post: "public", socialMedia: "public" },
        price: 100,
        geoLocation: {
            location: { type: "Point", coordinates: [-68.84, -32.89] },
            userSetted: true,
            description: "Mendoza",
            ratio: 10000,
        },
        category: [new Types.ObjectId()],
        attachedFiles: [],
        createAt: new Date().toISOString(),
        postBehaviourType: "libre",
        imagesUrls: images.map((image) => image.key),
        mediaSizes: images,
        year: 2022,
        brand: "Marca",
        modelType: "Modelo",
        condition: "Nuevo",
        endDate: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    });

    beforeAll(async () => {
        process.env.PRODUCTION_STORAGE_LIMIT_ENABLED = "true";
        process.env.PRODUCTION_FREE_STORAGE_BYTES = "1000";
        connection = mongoose.connection;
        const moduleRef: TestingModule = await mapModuleTesting.get("post")();
        postService = moduleRef.get<PostService>("PostServiceInterface");
        postGoodModel = moduleRef.get<Model<IPostGood>>("PostGoodModel");
        userModel = moduleRef.get<Model<IUser>>("UserModel");
        subscriptionPlanModel = moduleRef.get(getModelToken(SubscriptionPlanModel.modelName));
        subscriptionModel = moduleRef.get(getModelToken(SubscriptionModel.modelName));

        await createPlanOfSubscription(planId, subscriptionPlanModel, 40, 40, 40, "MP_STORAGE_TEST");
        await createSubscriptionForUser(
            subscriptionId,
            userId.toString(),
            planId,
            subscriptionModel,
            "MP_STORAGE_TEST",
        );
        await createPersonalUser(userModel, { _id: userId, subscriptions: [subscriptionId] });
    });

    afterAll(async () => {
        process.env.PRODUCTION_STORAGE_LIMIT_ENABLED = previousEnv.enabled;
        process.env.PRODUCTION_FREE_STORAGE_BYTES = previousEnv.free;
        if (previousEnv.enabled === undefined) delete process.env.PRODUCTION_STORAGE_LIMIT_ENABLED;
        if (previousEnv.free === undefined) delete process.env.PRODUCTION_FREE_STORAGE_BYTES;
        await userModel.deleteMany({});
        await subscriptionModel.deleteMany({});
        await subscriptionPlanModel.deleteMany({});
        await postGoodModel.deleteMany({});
        await connection.close();
    });

    it("guarda el peso de cada foto y video al crear", async () => {
        const { _id } = await postService.create(
            goodRequest("Con fotos", [
                { key: "foto1", sizeBytes: 300 },
                { key: "clipvideo", sizeBytes: 300 },
            ]) as any,
        );
        const post: any = await postGoodModel.findById(_id).lean();
        expect(post.mediaSizes).toEqual([
            { key: "foto1", sizeBytes: 300 },
            { key: "clipvideo", sizeBytes: 300 },
        ]);
    });

    it("rechaza un anuncio que no entra en el espacio y no lo crea", async () => {
        await expect(
            postService.create(goodRequest("No entra", [{ key: "grande", sizeBytes: 500 }]) as any),
        ).rejects.toThrow("No tenés espacio suficiente");
        expect(await postGoodModel.countDocuments({ title: "No entra" })).toBe(0);
    });

    it("al editar, sumar fotos que no entran se rechaza y quitar fotos libera", async () => {
        const post: any = await postGoodModel.findOne({ title: "Con fotos" }).lean();
        const id = post._id.toString();

        await expect(
            postService.updatePostById(
                {
                    imagesUrls: ["foto1", "clipvideo", "otra"],
                    mediaSizes: [{ key: "otra", sizeBytes: 500 }],
                } as any,
                id,
                "good",
            ),
        ).rejects.toThrow("No tenés espacio suficiente");

        await postService.updatePostById({ imagesUrls: ["foto1"] } as any, id, "good");
        const updated: any = await postGoodModel.findById(id).lean();
        expect(updated.mediaSizes).toEqual([{ key: "foto1", sizeBytes: 300 }]);

        // Con el espacio liberado (300 de 1000), ahora entra.
        await expect(
            postService.create(goodRequest("Ahora entra", [{ key: "grande", sizeBytes: 500 }]) as any),
        ).resolves.toBeDefined();
    });

    it("editar sin tocar las fotos no cambia el peso", async () => {
        const post: any = await postGoodModel.findOne({ title: "Con fotos" }).lean();
        await postService.updatePostById({ title: "Con fotos (editado)" } as any, post._id.toString(), "good");
        const updated: any = await postGoodModel.findById(post._id).lean();
        expect(updated.mediaSizes).toEqual([{ key: "foto1", sizeBytes: 300 }]);
    });
});

