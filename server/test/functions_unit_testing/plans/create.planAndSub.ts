import { Types } from "mongoose";

async function createPlanOfSubscription(plan_id: Types.ObjectId,
    subscriptionModel: any,
    libres: number,
    agenda: number,
    contact: number, 
    mpPreapprovalPlanId?: string) {
    await subscriptionModel.create({
        _id: plan_id,
        mpPreapprovalPlanId: mpPreapprovalPlanId ?? "FREE SUBSCRIPTION",
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
    mp_preapproval_id: string

) {
    await subscriptionPlanModel.create({
        _id: sub_id,
        mpPreapprovalId: mp_preapproval_id ?? "FREE SUBSCRIPTION",
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