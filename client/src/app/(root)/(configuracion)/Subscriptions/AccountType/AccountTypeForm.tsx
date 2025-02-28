import { useEffect, useState } from "react";
import FormCard from "../../FormCard";
import SubscriptionPlanSelection from "./SubscriptionPlanSelection";
import ActionButtons from "./ActionButtons";
import { getSubscriptionsPlans } from "@/services/subscriptionServices";
import { Subscription, SubscriptionPlan } from "@/types/subscriptions";
import { toastifyError } from "@/utils/functions/toastify";

const AccountTypeForm = ({
  setIsFormVisible,
  subscription,
}: {
  setIsFormVisible: (value: boolean) => void;
  subscription?: Subscription;
}) => {
  const previousSubscription = subscription;
  const [selected, setSelected] = useState(
    previousSubscription?.subscriptionPlan.isFree
      ? previousSubscription?.subscriptionPlan._id
      : previousSubscription?.subscriptionPlan.mpPreapprovalPlanId
  );
  const [subscriptionPlans, setSubscriptionPlans] = useState<
    SubscriptionPlan[]
  >([]);

  useEffect(() => {
    getSubscriptionsPlans()
      .then((data) => {
        setSubscriptionPlans(
          data.filter((subscription) => !subscription.isPack)
        );
      })
      .catch((err) => toastifyError(err));
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
        previousSubscription={previousSubscription}
        selectedPlan={selected}
        onClose={() => setIsFormVisible(false)}
      />
    </FormCard>
  );
};

export default AccountTypeForm;
