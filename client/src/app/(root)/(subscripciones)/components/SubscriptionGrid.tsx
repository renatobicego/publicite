"use client";
import { freeSubscriptionPlans, mockedPacks } from "@/app/utils/mockedData";
import SubscriptionPlanCard from "./SuscriptionPlanCard/SubscriptionPlanCard";
import { useState } from "react";
import PackCard from "./PackCard";
import { Subscription, SubscriptionPlan } from "@/types/subscriptions";
import FrequencyButtons from "./FrequencyButtons";
import { checkIfUserIsSubscribed } from "@/app/utils/utils";

const SubscriptionGrid = ({
  type,
  subscriptions,
  subscriptionsOfUser,
}: {
  type: "packs" | "suscripciones";
  subscriptions: SubscriptionPlan[];
  subscriptionsOfUser: Subscription[];
}) => {
  const [frequency, setFrequency] = useState(0);

  return (
    <>
      <FrequencyButtons
        frequency={frequency}
        setFrequency={setFrequency}
        type={type}
      />
      <div className="grid grid-cols-1 md:max-lg:flex flex-wrap lg:grid-cols-3 lg:w-full xl:w-11/12 2xl:w-5/6 3xl:w-3/4 gap-4 justify-center">
        {type === "packs"
          ? mockedPacks.map((plan) => (
              <PackCard
                key={plan._id}
                subscriptionPlan={plan}
                isPopular={plan.reason === "+ 20 Publicaciones Activas"}
              />
            ))
          : [...freeSubscriptionPlans, ...subscriptions].map((plan) => {
            const isUserSubscribed = checkIfUserIsSubscribed(subscriptionsOfUser, plan);
              return (
                <SubscriptionPlanCard
                  key={plan._id}
                  subscriptionPlan={plan}
                  isPopular={plan.reason === "Publicité Premium"}
                  isUserSubscribed={isUserSubscribed}
                />
              );
            })}
      </div>
    </>
  );
};

export default SubscriptionGrid;
