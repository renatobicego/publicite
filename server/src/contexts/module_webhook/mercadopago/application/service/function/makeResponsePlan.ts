import { SubscriptionKind, subscriptionKindOf } from 'src/contexts/module_shared/subscriptions/subscription.kind';

/*
Arma la respuesta del historial de suscripciones que usa el cliente:
- con un plan pago: plan principal + packs (sin el gratuito);
- sin plan pago: el gratuito (+ packs si los hay).
El extra temporal de cambio de plan (`kind: carryover`) apunta al plan viejo, así
que no puede competir por "plan principal": va siempre al final, aparte.
*/
function makeReponsePlanFunction(planes: any[]) {
    const response: any = [];
    if (!planes || planes.length <= 0) {
        return response
    }
    let countPackPlan = 0;
    let countMainPlan = 0;
    let countFreePlan = 0;
    const mainPlanArray: any = [];
    const packPlanArray: any = [];
    const freePlanArray: any = [];
    const carryoverArray: any = [];

    planes.forEach((plan: any) => {
        if (!plan?.subscriptionPlan) return;
        if (subscriptionKindOf(plan) === SubscriptionKind.CARRYOVER) {
            carryoverArray.push(plan);
        } else if (plan.subscriptionPlan.isPack) {
            countPackPlan++;
            packPlanArray.push(plan);
        } else if (!plan.subscriptionPlan.isPack && !plan.subscriptionPlan.isFree) {
            countMainPlan++;
            mainPlanArray.push(plan);
        } else if (plan.subscriptionPlan.isFree) {
            countFreePlan++;
            freePlanArray.push(plan);
        }
    });


    if (countFreePlan > countMainPlan && countFreePlan > countPackPlan) {
        response.push(...freePlanArray)
    } else if (countMainPlan >= countFreePlan) {
        response.push(...mainPlanArray)
        response.push(...packPlanArray)
    } else if (countPackPlan > countMainPlan) {
        response.push(...freePlanArray)
        response.push(...packPlanArray)
    }
    response.push(...carryoverArray)
    return response
}

export default makeReponsePlanFunction
