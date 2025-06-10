"use client";
import { useEffect, useState } from "react";
import { Skeleton } from "@nextui-org/react";
import PackCard from "./PackCard";
import SubscriptionPlanCard from "./SuscriptionPlanCard/SubscriptionPlanCard";
import FrequencyButtons from "./FrequencyButtons";
import type { Subscription, SubscriptionPlan } from "@/types/subscriptions";
import { checkIfUserIsSubscribed } from "@/utils/functions/utils";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    // Filter subscriptions based on frequency
    let filtered = subscriptions.filter((plan) => {
      if (frequency === 0) {
        return (
          plan.intervalTime === 7 || plan.intervalTime === 30 || plan.isFree
        );
      } else {
        return (
          plan.intervalTime === 365 || plan.intervalTime === 90 || plan.isFree
        );
      }
    });

    // Sort subscriptions in the desired order for the "suscripciones" type
    if (type === "suscripciones") {
      filtered = sortSubscriptionPlans(filtered);
    } else if (type === "packs") {
      filtered = sortPackPlans(filtered);
    }

    setFilteredSubscriptions(filtered);
    setIsLoading(false);
  }, [frequency, subscriptions, type]);

  // Function to sort subscription plans in the desired order
  const sortSubscriptionPlans = (
    plans: SubscriptionPlan[]
  ): SubscriptionPlan[] => {
    // Create a new array to avoid mutating the original
    const sortedPlans: SubscriptionPlan[] = [];

    // Find the free plan and add it first if it exists
    const freePlan = plans.find((plan) => plan.isFree);
    if (freePlan) sortedPlans.push(freePlan);

    // Find the Publicité Premium plan and add it second if it exists
    const premiumPlan = plans.find(
      (plan) => plan.reason === "Publicité Premium" && !plan.isFree
    );
    if (premiumPlan) sortedPlans.push(premiumPlan);

    // Add all remaining plans that aren't already included
    plans.forEach((plan) => {
      if (
        (!plan.isFree || plan !== freePlan) &&
        (plan.reason !== "Publicité Premium" || plan !== premiumPlan)
      ) {
        // Check if this plan is not already in the sortedPlans array
        if (!sortedPlans.includes(plan)) {
          sortedPlans.push(plan);
        }
      }
    });

    return sortedPlans;
  };

  // Add a new function to sort pack plans by postsLibresCount
  const sortPackPlans = (plans: SubscriptionPlan[]): SubscriptionPlan[] => {
    // Create a copy to avoid mutating the original array
    return [...plans].sort((a, b) => {
      // Then sort by postsLibresCount in ascending order (smaller packages first)
      // If postsLibresCount doesn't exist, use 0 as default
      const aCount = a.postsLibresCount || 0;
      const bCount = b.postsLibresCount || 0;
      return aCount - bCount;
    });
  };

  const containerGridStyle =
    "grid grid-cols-1 md:max-lg:flex flex-wrap lg:grid-cols-3 lg:w-full xl:w-11/12 2xl:w-5/6 3xl:w-3/4 gap-4 justify-center";

  if (isLoading) {
    return (
      <>
        <FrequencyButtons
          frequency={frequency}
          setFrequency={setFrequency}
          type={type}
        />
        <div className={containerGridStyle}>
          <Skeleton className="w-full h-72" />
          <Skeleton className="w-full h-72" />
          <Skeleton className="w-full h-72" />
        </div>
      </>
    );
  }

  return (
    <>
      <FrequencyButtons
        frequency={frequency}
        setFrequency={setFrequency}
        type={type}
      />
      <div className={containerGridStyle}>
        {type === "packs"
          ? // Render pack cards
            filteredSubscriptions.map((plan) => (
              <PackCard
                key={plan._id}
                subscriptionPlan={plan}
                isPopular={plan.reason === "+ 20 Publicaciones Activas"}
              />
            ))
          : // Render subscription plan cards
            filteredSubscriptions.map((plan) => {
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
    </>
  );
};

export default SubscriptionGrid;
