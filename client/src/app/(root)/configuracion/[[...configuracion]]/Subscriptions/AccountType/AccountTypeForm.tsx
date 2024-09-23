import { useEffect, useState } from "react";
import FormCard from "../../FormCard";
import SubscriptionPlanSelection from "./SubscriptionPlanSelection";
import ActionButtons from "./ActionButtons";
import { getSubscriptionsPlans } from "@/services/subscriptionServices";

const AccountTypeForm = ({
  setIsFormVisible,
}: {
  setIsFormVisible: (value: boolean) => void;
}) => {
  const previousSubscriptionPlan = "2c9380849146ff3d01914739031d0028";
  const [selected, setSelected] = useState(previousSubscriptionPlan);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);

  useEffect(() => {
    getSubscriptionsPlans().then((data) => {
      setSubscriptionPlans(data);
    });
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
