import { useEffect, useState } from "react";
import FormCard from "../../FormCard";
import SubscriptionPlanSelection from "./SubscriptionPlanSelection";
import ActionButtons from "./ActionButtons";
import { getSubscriptionsPlans } from "@/services/subscriptionServices";
import { Subscription, SubscriptionPlan } from "@/types/subscriptions";
import { toastifyError } from "@/utils/functions/toastify";
import { Spinner } from "@nextui-org/react";

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
  const [subscriptionPlans, setSubscriptionPlans] =
    useState<SubscriptionPlan[]>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    getSubscriptionsPlans()
      .then((data) => {
        const plansWithoutPackPlans = data.filter((plan) => !plan.isPack);
        const subscriptionFreeFirst = [
          ...plansWithoutPackPlans.filter((plan) => plan.isFree),
          ...plansWithoutPackPlans
            .filter((plan) => !plan.isFree)
            .sort((a, b) => a.intervalTime - b.intervalTime),
        ];
        setSubscriptionPlans(subscriptionFreeFirst);
      })
      .catch((err) => {
        setError("Error al cargar los planes de suscripción.");
        toastifyError(err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <FormCard title="Actualizar Cuenta" initialHeight={110}>
      {loading ? (
        <Spinner color="warning" />
      ) : error ? (
        <p className="text-red-500 text-center py-4">{error}</p>
      ) : (
        subscriptionPlans && (
          <>
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
          </>
        )
      )}
    </FormCard>
  );
};

export default AccountTypeForm;
