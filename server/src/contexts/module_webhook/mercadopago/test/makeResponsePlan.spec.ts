import makeReponsePlanFunction from "../application/service/function/makeResponsePlan";



describe('SubscriptionService - makeResponseDependingActivePlans', () => {



    it('should return free plan', () => {
        const plans = [
            {
                _id: '679d5e3506f5c9cf2c86d44c',
                subscriptionPlan: {
                    _id: '66c49508e80296e90ec637d8',
                    isPack: false,
                    isFree: true,
                },
            },
        ];

        const result = makeReponsePlanFunction(plans)
        expect(result).toEqual(plans);
    });


    it('should return only main plan', () => {
        const plans = [
            {
                //MAIN PLAN
                _id: '679d5e3506f5c9cf2c86d44c',
                subscriptionPlan: {
                    _id: '66c49508e80296e90ec637d8',
                    isPack: false,
                    isFree: false,
                },
            },

            {
                // FREE PLAN
                _id: '679d5e3506f5c9cf2c86d44c',
                subscriptionPlan: {
                    _id: '66c49508e80296e90ec637d8',
                    isPack: false,
                    isFree: true,
                },
            },
        ];

        const result = makeReponsePlanFunction(plans)
        expect(result).toEqual([plans[0]]);
    });


    it('should return only main plan and packs plan (1)', () => {
        const plans = [
            {
                //MAIN PLAN
                _id: '679d5e3506f5c9cf2c86d44c',
                subscriptionPlan: {
                    _id: '66c49508e80296e90ec637d8',
                    isPack: false,
                    isFree: false,
                },
            },

            {
                // FREE PLAN
                _id: '679d5e3506f5c9cf2c86d44c',
                subscriptionPlan: {
                    _id: '66c49508e80296e90ec637d8',
                    isPack: false,
                    isFree: true,
                },
            },
            {
                // PACK PLAN
                _id: '679d5e3506f5c9cf2c86d44c',
                subscriptionPlan: {
                    _id: '66c49508e80296e90ec637d8',
                    isPack: true,
                    isFree: false,
                },
            },
        ];

        const result = makeReponsePlanFunction(plans)
        expect(result).toEqual([plans[0], plans[2]]);
    });

    it('should return only main plan and packs plan (3)', () => {
        const plans = [
            {
                //MAIN PLAN
                _id: '679d5e3506f5c9cf2c86d44c',
                subscriptionPlan: {
                    _id: '66c49508e80296e90ec637d8',
                    isPack: false,
                    isFree: false,
                },
            },

            {
                // FREE PLAN
                _id: '679d5e3506f5c9cf2c86d44c',
                subscriptionPlan: {
                    _id: '66c49508e80296e90ec637d8',
                    isPack: false,
                    isFree: true,
                },
            },
            {
                // PACK PLAN
                _id: '679d5e3506f5c9cf2c86d44c',
                subscriptionPlan: {
                    _id: '66c49508e80296e90ec637d8',
                    isPack: true,
                    isFree: false,
                },
            },
            {
                // PACK PLAN
                _id: '679d5e3506f5c9cf2c86d44c',
                subscriptionPlan: {
                    _id: '66c49508e80296e90ec637d8',
                    isPack: true,
                    isFree: false,
                },
            },
            {
                // PACK PLAN
                _id: '679d5e3506f5c9cf2c86d44c',
                subscriptionPlan: {
                    _id: '66c49508e80296e90ec637d8',
                    isPack: true,
                    isFree: false,
                },
            },
        ];

        const result = makeReponsePlanFunction(plans)
        expect(result).toEqual([plans[0], plans[2], plans[3], plans[4]]);
    });

    it('should return only free plan and packs plan ', () => {
        const plans = [

            {
                // FREE PLAN
                _id: '679d5e3506f5c9cf2c86d44c',
                subscriptionPlan: {
                    _id: '66c49508e80296e90ec637d8',
                    isPack: false,
                    isFree: true,
                },
            },
            {
                // PACK PLAN
                _id: '679d5e3506f5c9cf2c86d44c',
                subscriptionPlan: {
                    _id: '66c49508e80296e90ec637d8',
                    isPack: true,
                    isFree: false,
                },
            },
            {
                // PACK PLAN
                _id: '679d5e3506f5c9cf2c86d44c',
                subscriptionPlan: {
                    _id: '66c49508e80296e90ec637d8',
                    isPack: true,
                    isFree: false,
                },
            },
            {
                // PACK PLAN
                _id: '679d5e3506f5c9cf2c86d44c',
                subscriptionPlan: {
                    _id: '66c49508e80296e90ec637d8',
                    isPack: true,
                    isFree: false,
                },
            },
        ];

        const result = makeReponsePlanFunction(plans)
        expect(result).toEqual([plans[0], plans[1], plans[2], plans[3]]);
    });




});
