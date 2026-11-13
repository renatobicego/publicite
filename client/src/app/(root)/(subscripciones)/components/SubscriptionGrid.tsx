"use client";
import { useEffect, useMemo, useState } from "react";
import { Skeleton, Tab, Tabs } from "@nextui-org/react";
import PackCard from "./PackCard";
import SubscriptionPlanCard from "./SuscriptionPlanCard/SubscriptionPlanCard";
import FrequencyButtons from "./FrequencyButtons";
import type { Subscription, SubscriptionPlan } from "@/types/subscriptions";
import { checkIfUserIsSubscribed } from "@/utils/functions/utils";
import {
  PACK_CATEGORY_LABELS,
  PACK_CATEGORY_ORDER,
  PackCategory,
  packAmountOf,
  packCategoryOf,
  userHasPack,
} from "@/utils/functions/packs";

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

  // Packs: anuncios, tokens de IA y almacenamiento, sólo las categorías que existen.
  const packCategories = useMemo(
    () =>
      type === "packs"
        ? PACK_CATEGORY_ORDER.filter((category) =>
            subscriptions.some((plan) => packCategoryOf(plan) === category)
          )
        : [],
    [subscriptions, type]
  );
  const [packCategory, setPackCategory] = useState<PackCategory>("anuncios");
  const activePackCategory = packCategories.includes(packCategory)
    ? packCategory
    : packCategories[0];

  useEffect(() => {
    setIsLoading(true);

    // Filter subscriptions based on frequency
    let filtered = subscriptions.filter((plan) => {
      if (type === "packs" && packCategoryOf(plan) !== activePackCategory) {
        return false;
      }
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
  }, [frequency, subscriptions, type, activePackCategory]);

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

  // Packs de menor a mayor según lo que suman (anuncios, tokens o bytes).
  const sortPackPlans = (plans: SubscriptionPlan[]): SubscriptionPlan[] =>
    [...plans].sort((a, b) => packAmountOf(a) - packAmountOf(b));

  const containerGridStyle =
    "grid grid-cols-1 md:max-lg:flex flex-wrap lg:grid-cols-3 lg:w-full xl:w-11/12 2xl:w-5/6 3xl:w-3/4 gap-4 justify-center";

  const packCategoryTabs =
    type === "packs" && packCategories.length > 1 ? (
      <Tabs
        aria-label="Tipo de pack"
        radius="full"
        selectedKey={activePackCategory}
        onSelectionChange={(key) => setPackCategory(key as PackCategory)}
      >
        {packCategories.map((category) => (
          <Tab key={category} title={PACK_CATEGORY_LABELS[category]} />
        ))}
      </Tabs>
    ) : null;

  if (isLoading) {
    return (
      <>
        {packCategoryTabs}
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
      {packCategoryTabs}
      <FrequencyButtons
        frequency={frequency}
        setFrequency={setFrequency}
        type={type}
      />
      {type === "packs" && filteredSubscriptions.length === 0 && (
        <p className="text-sm text-light-text">
          No hay packs {frequency === 0 ? "mensuales" : "trimestrales"} de este
          tipo.
        </p>
      )}
      <div className={containerGridStyle}>
        {type === "packs"
          ? // Render pack cards
            filteredSubscriptions.map((plan) => (
              <PackCard
                key={plan._id}
                subscriptionPlan={plan}
                isPopular={plan.reason === "+ 20 Publicaciones Activas"}
                alreadyHasIt={userHasPack(plan, subscriptionsOfUser)}
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
