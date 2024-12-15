import SecondaryButton from "@/components/buttons/SecondaryButton";
import { SubscriptionPlan } from "@/types/subscriptions";
import { Button, Link } from "@nextui-org/react";

const ActionButtons = ({
  previousPlan,
  selectedPlan,
  subscriptionPlans,
  onClose,
}: {
  previousPlan?: string;
  selectedPlan?: string;
  onClose: () => void;
  subscriptionPlans: SubscriptionPlan[];
}) => {
  const isSamePlan = previousPlan === selectedPlan;
  const isFreePlanSelected =
    selectedPlan === subscriptionPlans.find((s) => s.freePlan === true)?._id; // ID of the free plan
  const isFreePlanCurrent =
    previousPlan === subscriptionPlans.find((s) => s.freePlan === true)?._id;

  return (
    <div className="flex gap-2 justify-end w-full items-center">
      <Button color="default" variant="light" radius="full" onPress={onClose}>
        Cerrar
      </Button>
      {!isSamePlan && (
        <>
          {isFreePlanSelected && !isFreePlanCurrent && (
            <Button
              color="danger"
              variant="light"
              radius="full"
              onPress={onClose}
            >
              Cancelar Subscripción
            </Button>
          )}
          {!isFreePlanSelected && (
            <SecondaryButton as={Link} href={`/suscribirse/${selectedPlan}`}>
              Continuar
            </SecondaryButton>
          )}
        </>
      )}
    </div>
  );
};

export default ActionButtons;
