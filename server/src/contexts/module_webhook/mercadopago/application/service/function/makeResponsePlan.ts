function makeReponsePlanFunction(planes: any[]) {
    let countPackPlan = 0;
    let countMainPlan = 0;
    let countFreePlan = 0;
    let mainPlanArray: any = [];
    let packPlanArray: any = [];
    let freePlanArray: any = [];
    const response: any = [];
    if (planes.length <= 0 || !planes) {
        return response
    }
    planes.forEach((plan: { subscriptionPlan: { isPack: any; isFree: any; }; }) => {
        if (plan.subscriptionPlan.isPack) {
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
        return freePlanArray
    }
    if (countMainPlan >= countFreePlan) {
        response.push(...mainPlanArray)
        response.push(...packPlanArray)
        return response
    }

    if (countPackPlan > countMainPlan) {
        response.push(...freePlanArray)
        response.push(...packPlanArray)
        return response
    }
}

export default makeReponsePlanFunction