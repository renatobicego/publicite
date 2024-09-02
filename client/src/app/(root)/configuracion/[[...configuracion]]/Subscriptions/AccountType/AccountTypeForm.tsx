import { useState } from "react";
import FormCard from "../../FormCard";
import { SubscriptionPlan } from "@/types/subscriptions";
import SubscriptionPlanSelection from "./SubscriptionPlanSelection";
import ActionButtons from "./ActionButtons";

const AccountTypeForm = ({
  setIsFormVisible,
}: {
  setIsFormVisible: (value: boolean) => void;
}) => {
  const previousSubscriptionPlan = "2c9380849146ff3d01914739031d0028";
  const [selected, setSelected] = useState(previousSubscriptionPlan);

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      _id: "2c9380849146f28",
      reason: "Gratuita",
      price: 6500,
      description: "Gratuita",
      features: ["Beneficio 1", "Beneficio 2", "Beneficio 3"],
      freePlan: true,
    },
    {
      _id: "2c9380849146ff3d01914739031d0028",
      reason: "Publicité Premium",
      price: 6500,
      description: "Publicité Premium",
      features: ["Beneficio 1", "Beneficio 2", "Beneficio 3"],
    },
    {
      _id: "2c9380849146ff3d01914739038",
      reason: "Publicité Premium Gold",
      price: 10000,
      description: "Publicité Premium Gold",
      features: ["Beneficio 1", "Beneficio 2", "Beneficio 3"],
    },
  ];

  return (
    <FormCard title="Actualizar Cuenta" initialHeight={110}>
      <SubscriptionPlanSelection
        subscriptionPlans={subscriptionPlans}
        selected={selected}
        onPlanChange={setSelected}
      />
      <ActionButtons
        subscriptionPlans={subscriptionPlans}
        previousPlan={previousSubscriptionPlan}
        selectedPlan={selected}
        onClose={() => setIsFormVisible(false)}
      />
    </FormCard>
  );
};

export default AccountTypeForm;
