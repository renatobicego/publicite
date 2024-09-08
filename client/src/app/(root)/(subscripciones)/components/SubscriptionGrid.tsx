"use client";
import { mockedPacks, mockedSubscriptionPlans } from "@/app/utils/mockedData";
import SubscriptionPlanCard from "./SubscriptionPlanCard";
import { useState } from "react";
import BWButton from "@/app/components/buttons/BWButton";
import PackCard from "./PackCard";

const SubscriptionGrid = ({ type }: { type: "packs" | "suscripciones" }) => {
  const [frequency, setFrequency] = useState(0);
  return (
    <>
      <div className="flex gap-2 items-center">
        <BWButton
          variant={frequency === 0 ? "solid" : "bordered"}
          blackOrWhite={frequency === 0 ? "black" : "white"}
          onClick={() => setFrequency(0)}
        >
          {type === "packs" ? "Por 1 Mes" : "Mensual"}
        </BWButton>
        <BWButton
          variant={frequency === 1 ? "solid" : "bordered"}
          blackOrWhite={frequency === 1 ? "black" : "white"}
          onClick={() => setFrequency(1)}
        >
          {type === "packs" ? "Por 3 meses" : "Anual"}
        </BWButton>
      </div>
      <div className="grid grid-cols-1 md:max-lg:flex flex-wrap lg:grid-cols-3 lg:w-full xl:w-11/12 2xl:w-5/6 3xl:w-3/4 gap-4 justify-center">
        {type === "packs"
          ? mockedPacks.map((plan) => (
              <PackCard
                key={plan._id}
                subscriptionPlan={plan}
                isPopular={plan.reason === "+ 20 Publicaciones Activas"}
              />
            ))
          : mockedSubscriptionPlans.map((plan) => (
              <SubscriptionPlanCard
                key={plan._id}
                subscriptionPlan={plan}
                isPopular={plan.reason === "Premium"}
              />
            ))}
      </div>
    </>
  );
};

export default SubscriptionGrid;
