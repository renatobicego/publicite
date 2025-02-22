import { Types } from "mongoose";

async function createPlanOfSubscription(plan_id: Types.ObjectId, subscriptionModel: any, libres: number, agenda: number, contact: number) {
    await subscriptionModel.create({
        _id: plan_id,
        mpPreapprovalPlanId: "This is a free plan",
        isActive: true,
        reason: "Publicité Free",
        description: "Este plan es publicite free.",
        features: ["feature1", "feature2"],
        intervalTime: 7,
        price: 0,
        isFree: true,
        postsLibresCount: libres,
        postsAgendaCount: agenda,
        maxContacts: contact
    });

}


async function createSubscriptionForUser(
    sub_id: Types.ObjectId,
    external_reference: string,
    sub_plan_id: Types.ObjectId,
    subscriptionPlanModel: any,

) {
    await subscriptionPlanModel.create({
        _id: sub_id,
        mpPreapprovalId: "FREE SUBSCRIPTION",
        payerId: "FREE SUBSCRIPTION",
        status: "authorized",
        subscriptionPlan: sub_plan_id,
        startDate: "test",
        endDate: "test",
        external_reference: external_reference,
        timeOfUpdate: "FREE SUBSCRIPTION",
        nextPaymentDate: "FREE SUBSCRIPTION",
        paymentMethodId: "FREE SUBSCRIPTION",
        cardId: "FREE SUBSCRIPTION",
        __v: 0
    });


}




export { createPlanOfSubscription, createSubscriptionForUser }