import { useEffect, useState } from "react";
import FormCard from "../../FormCard";
import SubscriptionPlanSelection from "./SubscriptionPlanSelection";
import ActionButtons from "./ActionButtons";
import { getSubscriptionsPlans } from "@/services/subscriptionServices";
import { Subscription } from "@/types/subscriptions";

const AccountTypeForm = ({
  setIsFormVisible,
  subscription,
}: {
  setIsFormVisible: (value: boolean) => void;
  subscription?: Subscription;
}) => {
  const previousSubscriptionPlan = subscription;
  const [selected, setSelected] = useState(previousSubscriptionPlan?.subscriptionPlan._id);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    getSubscriptionsPlans(signal).then((data) => {
      setSubscriptionPlans(data);
    });

    return () => abortController.abort();
  }, []);

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
