import { TestingModule } from "@nestjs/testing";
import mongoose, { Connection, Model } from "mongoose";
import { getModelToken } from "@nestjs/mongoose";


import mapContactSellerModuleTesting from "./test.module";
import { ContactSellerAdapter } from "../infrastructure/contactSeller.adapter";
import { ContactSellerDocument, ContactSellerModel } from "../infrastructure/schema/contactSeller.schema";


interface ContactSeller_model {
    post: any;
    client: {
        clientId: string | undefined;
        name: string;
        email: string;
        lastName: string;
        username: string;
        phone: string;
        message: string;
    };
    notification_id: any;
    owner: any;
}

describe('ContactSeller - Constructor', () => {

    let connection: Connection;
    let contactSellerAdapter: ContactSellerAdapter;
    let contactSellerModel: Model<ContactSellerDocument>;

    afterAll(async () => {
        await connection.close();
        await contactSellerModel.deleteMany({});
    })
    beforeAll(async () => {
        const moduleRef: TestingModule = await mapContactSellerModuleTesting.get("contactSeller")();
        contactSellerAdapter = moduleRef.get<ContactSellerAdapter>('ContactSellerAdapterInterface');
        connection = mongoose.connection;
        contactSellerModel = moduleRef.get<Model<ContactSellerDocument>>(getModelToken(ContactSellerModel.modelName));

    });

    it('If user is not register should create isOpinionRequested in true and isOpinionRequestAvailable in false', async () => {
        const post_id = new mongoose.Types.ObjectId("676e9ebc3c33c13dae0e28ee");
        const contactSeller: ContactSeller_model = {
            post: post_id,
            client: {
                clientId: undefined,
                name: "name",
                email: "email",
                lastName: "lastName",
                username: "username",
                phone: "phone",
                message: "message"
            },
            notification_id: new mongoose.Types.ObjectId("676e9ebc3c33c13dae0e28ee"),
            owner: new mongoose.Types.ObjectId("676e9ebc3c33c13dae0e28ee"),
        }

        await contactSellerAdapter.createContactSeller(contactSeller);

        const contactSellerCreated = await contactSellerModel.find({ owner: contactSeller.owner });

        console.log("Verificar si el isOpinionRequested es true y el isOpinionRequestAvailable es false");
        expect(contactSellerCreated[0].isOpinionRequested).toBe(true);
        expect(contactSellerCreated[0].isOpinionRequestAvailable).toBe(false);


    })

    it('If user is register should create isOpinionRequested in false and isOpinionRequestAvailable in true', async () => {
        const post_id = new mongoose.Types.ObjectId("676e9ebc3c33c13dae0e28ee");
        const contactSeller: ContactSeller_model = {
            post: post_id,
            client: {
                clientId: "676e9ebc3c33c13dae0e28ee",
                name: "name",
                email: "email",
                lastName: "lastName",
                username: "username",
                phone: "phone",
                message: "message"
            },
            notification_id: new mongoose.Types.ObjectId("676e9ebc3c33c13dae0e28ee"),
            owner: new mongoose.Types.ObjectId("676e9ebc3c33c13dae0e28ef"),
        }

        await contactSellerAdapter.createContactSeller(contactSeller);

        const contactSellerCreated = await contactSellerModel.find({ owner: contactSeller.owner });

        console.log("Verificar si el isOpinionRequested es true y el isOpinionRequestAvailable es false");
        expect(contactSellerCreated[0].isOpinionRequested).toBe(false);
        expect(contactSellerCreated[0].isOpinionRequestAvailable).toBe(true);


    })


})