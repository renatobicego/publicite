import { useState } from "react";
import FormCard from "../../FormCard";
import SubscriptionPlanSelection from "./SubscriptionPlanSelection";
import ActionButtons from "./ActionButtons";
import { mockedSubscriptionPlans } from "@/app/utils/mockedData";

const AccountTypeForm = ({
  setIsFormVisible,
}: {
  setIsFormVisible: (value: boolean) => void;
}) => {
  const previousSubscriptionPlan = "2c9380849146ff3d01914739031d0028";
  const [selected, setSelected] = useState(previousSubscriptionPlan);



  return (
    <FormCard title="Actualizar Cuenta" initialHeight={110}>
      <SubscriptionPlanSelection
        subscriptionPlans={mockedSubscriptionPlans}
        selected={selected}
        onPlanChange={setSelected}
      />
      <ActionButtons
        subscriptionPlans={mockedSubscriptionPlans}
        previousPlan={previousSubscriptionPlan}
        selectedPlan={selected}
        onClose={() => setIsFormVisible(false)}
      />
    </FormCard>
  );
};

export default AccountTypeForm;
