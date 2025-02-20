import mongoose, { Model, Connection, Types } from "mongoose";
import { TestingModule } from "@nestjs/testing";
import mpTestingModule from "./test.module";
import { SubscriptionRepository } from "../../../infastructure/repository/mp-subscription.repository";
import { MercadoPagoSubscriptionPlanService } from "../mp-subscriptionPlan.service";
import { UserService } from "src/contexts/module_user/user/application/service/user.service";
import { MpSubscriptionService } from "../mp-subscription.service";
import { Subscription_preapproval } from "../../../domain/entity_mp/subscription_preapproval";
import { createPersonalUser } from "src/contexts/module_user/user/test/functions/create.user";
import { IUser, UserModel } from "src/contexts/module_user/user/infrastructure/schemas/user.schema";
import { getModelToken } from "@nestjs/mongoose";
import SubscriptionPlanModel, { SubscriptionPlanDocument } from "../../../infastructure/schemas/subscriptionPlan.schema";
import SubscriptionModel, { SubscriptionDocument } from "../../../infastructure/schemas/subscription.schema";
import { MpHandlerEvents } from "../../../infastructure/adapters/handler/mpHandlerFETCHEvents";
import { BadRequestException } from "@nestjs/common";


interface SubscriptionPlan {
    mpPreapprovalPlanId: string
    isActive: boolean,
    reason: string,
    description: string,
    features: string[],
    intervalTime: number,
    price: number,
    isFree: boolean,
    postsLibresCount: number,
    postsAgendaCount: number,
    maxContacts: number,
    isPack: boolean
}



describe('MercadopagoService - Subscription', () => {
    let connection: Connection;


    let mpSubscriptionService: MpSubscriptionService;


    let userModel: Model<IUser>;
    let subscriptionPlanModel: Model<SubscriptionPlanDocument>
    let subscriptionModel: Model<SubscriptionDocument>


    const subcriptionPlanMeli_id = "2c93808494b8c5eb0194be9f312902f1"
    const reason = "Publicité Premium TEST"
    const user_id = new Types.ObjectId("66c49508e80296e90ec637d8");


    beforeAll(async () => {


        connection = mongoose.connection;
        const moduleRef: TestingModule = await mpTestingModule.get("mp_testing_module")();


        mpSubscriptionService = moduleRef.get<MpSubscriptionService>('SubscriptionServiceInterface');


        userModel = moduleRef.get<Model<IUser>>(getModelToken(UserModel.modelName));
        subscriptionPlanModel = moduleRef.get<Model<SubscriptionPlanDocument>>(getModelToken(SubscriptionPlanModel.modelName));
        subscriptionModel = moduleRef.get<Model<SubscriptionDocument>>(getModelToken(SubscriptionModel.modelName));

      
        await createPersonalUser(user_id, userModel, new Map([["subscriptions", []]]));
        await subscriptionPlanModel.create({
            mpPreapprovalPlanId: subcriptionPlanMeli_id,
            isActive: true,
            reason: reason,
            description: "Este plan es publicite premium.",
            features: ["TEST"],
            intervalTime: 0,
            price: 0,
            isFree: false,
            postsLibresCount: 0,
            postsAgendaCount: 0,
            maxContacts: 0,
            isPack: false

        })
    });

    afterAll(async () => {
        await connection.close();
        await userModel.deleteMany({});
        await subscriptionPlanModel.deleteMany({});
        await subscriptionModel.deleteMany({});

    });




    it('Create a subscription', async () => {





        const subscription_preapproval: Subscription_preapproval = {
            id: subcriptionPlanMeli_id,
            payer_id: 22,
            payer_email: "",
            back_url: "",
            collector_id: 0,
            application_id: 0,
            status: "authorized",
            reason: reason,
            external_reference: "66c49508e80296e90ec637d8",
            date_created: "",
            last_modified: "",
            init_point: "",
            preapproval_plan_id: subcriptionPlanMeli_id,
            auto_recurring: {
                frequency: 0,
                frequency_type: "",
                transaction_amount: 0,
                currency_id: "",
                start_date: "2020-06-02T13:07:14.260Z",
                end_date: "2020-06-02T13:07:14.260Z",
                billing_day_proportional: false,
                has_billing_day: false,
                free_trial: undefined
            },
            summarized: {
                quotas: 0,
                charged_quantity: 0,
                pending_charge_quantity: 0,
                charged_amount: 0,
                pending_charge_amount: 0,
                semaphore: "",
                last_charged_date: "",
                last_charged_amount: 0
            },
            next_payment_date: "TEST",
            payment_method_id: "TEST",
            card_id: "TEXT",
            payment_method_id_secondary: null,
            first_invoice_offset: undefined,
            subscription_id: "",
            owner: undefined
        }
        await mpSubscriptionService.createSubscription_preapproval(subscription_preapproval);

        const user: any = await userModel.findById(user_id).select("subscriptions").populate([
            {
                path: "subscriptions",
                populate: {
                    path: "subscriptionPlan"
                }
            }
        ])
        expect(user?.subscriptions.length).toBe(1);
        expect(user?.subscriptions[0].mpPreapprovalId).toBe(subcriptionPlanMeli_id);
        expect(user?.subscriptions[0].subscriptionPlan.mpPreapprovalPlanId).toBe(subcriptionPlanMeli_id);
        expect(user?.subscriptions[0].subscriptionPlan.reason).toBe(subscription_preapproval.reason);


    });



    it('Create a subscription without auto_recurring', async () => {


     



        const subscription_preapproval: any = {
            id: subcriptionPlanMeli_id,
            payer_id: 22,
            payer_email: "",
            back_url: "",
            collector_id: 0,
            application_id: 0,
            status: "authorized",
            reason: reason,
            external_reference: "66c49508e80296e90ec637d8",
            date_created: "",
            last_modified: "",
            init_point: "",
            preapproval_plan_id: subcriptionPlanMeli_id,

        }
        await expect(mpSubscriptionService.createSubscription_preapproval(subscription_preapproval))
            .rejects.toThrow(/Invalid subscription data/);



    });

    it('Create a subscription without external_reference', async () => {




        const subscription_preapproval: any = {
            id: subcriptionPlanMeli_id,
            payer_id: 22,
            payer_email: "",
            back_url: "",
            collector_id: 0,
            application_id: 0,
            status: "authorized",
            reason: reason,

            date_created: "",
            last_modified: "",
            init_point: "",
            preapproval_plan_id: subcriptionPlanMeli_id,
            auto_recurring: {
                frequency: 0,
                frequency_type: "",
                transaction_amount: 0,
                currency_id: "",
                start_date: "2020-06-02T13:07:14.260Z",
                end_date: "2020-06-02T13:07:14.260Z",
                billing_day_proportional: false,
                has_billing_day: false,
                free_trial: undefined

            },

        }
        await expect(mpSubscriptionService.createSubscription_preapproval(subscription_preapproval))
            .rejects.toThrow(/Invalid subscription data/);




    });


    it('Create a subscription with invalid Plan ID', async () => {




        const subscription_preapproval: any = {
            id: subcriptionPlanMeli_id,
            payer_id: 22,
            payer_email: "",
            back_url: "",
            collector_id: 0,
            application_id: 0,
            status: "authorized",
            reason: reason,
            external_reference: user_id,
            date_created: "",
            last_modified: "",
            init_point: "",
            preapproval_plan_id: "ID ERROR",
            auto_recurring: {
                frequency: 0,
                frequency_type: "",
                transaction_amount: 0,
                currency_id: "",
                start_date: "2020-06-02T13:07:14.260Z",
                end_date: "2020-06-02T13:07:14.260Z",
                billing_day_proportional: false,
                has_billing_day: false,
                free_trial: undefined

            },

        }
        await expect(mpSubscriptionService.createSubscription_preapproval(subscription_preapproval))
            .rejects.toThrow(/Plan not found, we can't create the subscription/);





    });





})// end
