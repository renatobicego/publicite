import { RadioGroup } from "@nextui-org/react";
import { SubscriptionPlan } from "@/types/subscriptions";
import SubscriptionCard from "./SubscriptionCard";

const SubscriptionPlanSelection = ({
  subscriptionPlans,
  selected,
  onPlanChange,
}: {
  subscriptionPlans: SubscriptionPlan[];
  selected?: string;
  onPlanChange: (planId: string) => void;
}) => {
  return (
    <RadioGroup
      description="Selecciona el plan de suscripción para tu cuenta"
      value={selected}
      onValueChange={onPlanChange}
    >
      {subscriptionPlans.map((plan) => (
        <SubscriptionCard
          isFree={plan.isFree}
          key={plan.isFree ? plan._id : plan.mpPreapprovalPlanId}
          subscriptionPlan={plan}
        />
      ))}
    </RadioGroup>
  );
};

export default SubscriptionPlanSelection;
