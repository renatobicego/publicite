import SecondaryButton from "@/components/buttons/SecondaryButton";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { editSubscription } from "@/services/subscriptionServices";
import { Subscription, SubscriptionPlan } from "@/types/subscriptions";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { Button, Link } from "@nextui-org/react";

const ActionButtons = ({
  previousPlan,
  selectedPlan,
  subscriptionPlans,
  onClose,
}: {
  previousPlan?: Subscription;
  selectedPlan?: string;
  onClose: () => void;
  subscriptionPlans: SubscriptionPlan[];
}) => {
  const isSamePlan = previousPlan?.subscriptionPlan._id === selectedPlan;
  const isFreePlanSelected =
    selectedPlan === subscriptionPlans.find((s) => s.isFree === true)?._id; // ID of the free plan
  const isFreePlanCurrent =
    previousPlan === subscriptionPlans.find((s) => s.isFree === true)?._id;

  const handleCancelSubscription = () => {
    if (!previousPlan) {
      toastifyError("No hay una subscripción activa.");
      return;
    }
    editSubscription(previousPlan.mpPreapprovalId, { status: "cancelled" })
      .then(() => {
        toastifySuccess("Subscripción cancelada con éxito");
        onClose();
      })
      .catch(() => toastifyError("Error al cancelar la subscripción"));
  };

  return (
    <div className="flex gap-2 justify-end w-full items-center">
      <Button color="default" variant="light" radius="full" onPress={onClose}>
        Cerrar
      </Button>
      {!isSamePlan && (
        <>
          {isFreePlanSelected && !isFreePlanCurrent && (
            <ConfirmModal
              ButtonAction={
                <Button
                  color="danger"
                  variant="light"
                  radius="full"
                  onPress={onClose}
                >
                  Cancelar Subscripción
                </Button>
              }
              confirmText="Cancelar Subscripción"
              message="Estas seguro que quieres cancelar tu subscripción?"
              tooltipMessage="Cambiar a Plan Gratuito"
              onConfirm={handleCancelSubscription}
              sideText="Los anuncios de tu cuenta que sobrepasen el límite de tu plan actual serán ocultados. Puedes ver los anuncios ocultos en tu perfil."
            />
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
