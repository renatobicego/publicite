"use client";
import { mockedPacks } from "@/utils/data/mockedData";
import SubscriptionPlanCard from "./SuscriptionPlanCard/SubscriptionPlanCard";
import { Suspense, useEffect, useState } from "react";
import PackCard from "./PackCard";
import { Subscription, SubscriptionPlan } from "@/types/subscriptions";
import FrequencyButtons from "./FrequencyButtons";
import { checkIfUserIsSubscribed } from "@/utils/functions/utils";
import { Skeleton } from "@nextui-org/react";

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
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<
    SubscriptionPlan[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    console.log(subscriptions);
    if (frequency === 0) {
      setFilteredSubscriptions(
        subscriptions.filter(
          (plan) =>
            plan.intervalTime === 7 || plan.intervalTime === 30 || plan.isFree
        )
      );
    } else if (frequency === 1) {
      setFilteredSubscriptions(
        subscriptions.filter(
          (plan) =>
            plan.intervalTime === 365 || plan.intervalTime === 90 || plan.isFree
        )
      );
    }
    setIsLoading(false);
  }, [frequency, subscriptions, type]);

  const containerGridStyle =
    "grid grid-cols-1 md:max-lg:flex flex-wrap lg:grid-cols-3 lg:w-full xl:w-11/12 2xl:w-5/6 3xl:w-3/4 gap-4 justify-center";
  return (
    <>
      <FrequencyButtons
        frequency={frequency}
        setFrequency={setFrequency}
        type={type}
      />
      <Suspense
        fallback={
          <div className={containerGridStyle}>
            <Skeleton className="w-full h-72" />
            <Skeleton className="w-full h-72" />
            <Skeleton className="w-full h-72" />
          </div>
        }
      >
        <div className={containerGridStyle}>
          {type === "packs"
            ? filteredSubscriptions.map((plan) => (
                <PackCard
                  key={plan._id}
                  subscriptionPlan={plan}
                  isPopular={plan.reason === "+ 20 Publicaciones Activas"}
                />
              ))
            : [
                filteredSubscriptions.find(
                  (plan) => plan.isFree
                ) as SubscriptionPlan,
                ...filteredSubscriptions.filter((plan) => !plan.isFree),
              ].map((plan) => {
                const isUserSubscribed = checkIfUserIsSubscribed(
                  subscriptionsOfUser,
                  plan
                );
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
      </Suspense>
    </>
  );
};

export default SubscriptionGrid;
