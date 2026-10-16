import { Types } from "mongoose";

/*
Los helpers de test crean documentos con _id FIJO sobre una base compartida entre specs.
Si una corrida anterior no llegó a limpiar (p. ej. jest corre con --forceExit y corta
antes del afterAll), el create siguiente choca con el documento viejo y el spec falla por
estado heredado y no por el código. Por eso cada helper borra lo suyo antes de crear:
así el setup es idempotente y no depende de en qué orden corran los specs.
*/
async function createPlanOfSubscription(plan_id: Types.ObjectId,
    subscriptionModel: any,
    libres: number,
    agenda: number,
    contact: number,
    mpPreapprovalPlanId?: string) {
    await subscriptionModel.deleteOne({ _id: plan_id });
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
    // mpPreapprovalId tiene índice único: hay que limpiarlo además del _id.
    await subscriptionPlanModel.deleteOne({ _id: sub_id });
    await subscriptionPlanModel.deleteMany({
        mpPreapprovalId: mp_preapproval_id ?? "FREE SUBSCRIPTION",
    });
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