import mongoose, { Connection, Model, Types } from "mongoose";
import { TestingModule } from "@nestjs/testing";

import mapModuleTesting from "./post.test.module";
import { PostService } from "../post/application/service/post.service";
import { IPostGood } from "../post/infraestructure/schemas/post-types-schemas/post.good.schema";

/**
 * Solapa Geolocalizados (internamente "libres"): del más cercano al más lejano.
 */
describe("Post Service Testing - Geolocalizados por cercanía", () => {
    let connection: Connection;
    let postService: PostService;
    let postGoodModel: Model<IPostGood>;
    const authorId = new Types.ObjectId();
    // Visitante en el centro de Mendoza; los anuncios a ~1, ~6 y ~25 km.
    const visitor = { latitude: -32.89, longitude: -68.84 };
    const at = (title: string, lat: number) => ({
        title,
        searchTitle: title.toLowerCase(),
        author: authorId,
        postType: "good",
        description: "",
        searchDescription: "",
        visibility: { post: "public", socialMedia: "public" },
        price: 1,
        geoLocation: {
            location: { type: "Point", coordinates: [visitor.longitude, lat] },
            userSetted: true,
            description: title,
            ratio: 100000,
        },
        category: [],
        attachedFiles: [],
        createAt: new Date().toISOString(),
        postBehaviourType: "libre",
        isActive: true,
        endDate: new Date(Date.now() + 7 * 24 * 3600 * 1000),
        imagesUrls: ["x"],
        reviews: [],
    });

    beforeAll(async () => {
        connection = mongoose.connection;
        const moduleRef: TestingModule = await mapModuleTesting.get("post")();
        postService = moduleRef.get<PostService>("PostServiceInterface");
        postGoodModel = moduleRef.get<Model<IPostGood>>("PostGoodModel");
        await postGoodModel.syncIndexes();
        // Se insertan desordenados a propósito.
        await postGoodModel.insertMany([
            at("lejos", visitor.latitude - 0.225),
            at("cerca", visitor.latitude - 0.009),
            at("medio", visitor.latitude - 0.054),
        ] as any[]);
    });

    afterAll(async () => {
        await postGoodModel.deleteMany({});
        await connection.close();
    });

    it("la solapa Geolocalizados ordena del más cercano al más lejano", async () => {
        const { posts } = await postService.findAllPosts(1, 10, visitor as any);
        expect(posts.map((post: any) => post.title)).toEqual(["cerca", "medio", "lejos"]);
    });

    it("también dentro de Geolocalizados › Bienes", async () => {
        const { posts } = await postService.findAllPostByPostType(1, 10, "good", visitor as any);
        expect(posts.map((post: any) => post.title)).toEqual(["cerca", "medio", "lejos"]);
    });
});
