"use client";

import SecondaryButton from "@/components/buttons/SecondaryButton";
const ConfirmModal = lazy(() => import("@/components/modals/ConfirmModal"));
import { cancelMySubscription } from "@/services/subscriptionServices";
import { Subscription, SubscriptionPlan } from "@/types/subscriptions";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { useActiveSubscriptions } from "@/app/(root)/providers/userDataProvider";
import { useUser } from "@clerk/nextjs";
import { Button, Link, Spinner } from "@nextui-org/react";
import { lazy, Suspense } from "react";

const ActionButtons = ({
  previousSubscription,
  selectedPlan,
  subscriptionPlans,
  onClose,
}: {
  previousSubscription?: Subscription;
  selectedPlan?: string;
  onClose: () => void;
  subscriptionPlans: SubscriptionPlan[];
}) => {
  const previousSubscriptionPlanId = previousSubscription?.subscriptionPlan._id;
  const isSamePlanSelected = previousSubscription?.subscriptionPlan.isFree // if its free, compare db id
    ? previousSubscriptionPlanId === selectedPlan
    : previousSubscription?.subscriptionPlan.mpPreapprovalPlanId ===
      selectedPlan; // if not compare mp id
  const isFreePlanSelected =
    selectedPlan === subscriptionPlans.find((s) => s.isFree === true)?._id; // ID of the free plan
  const isFreePlanCurrent =
    previousSubscriptionPlanId ===
    subscriptionPlans.find((s) => s.isFree === true)?._id;

  const { refreshActiveSubscriptions } = useActiveSubscriptions();
  const { user } = useUser();

  /*
  La baja la hace el server (valida que la suscripción sea del usuario y espera
  a MercadoPago). Antes el resultado no se miraba y siempre se mostraba "éxito".
  */
  const handleCancelSubscription = async () => {
    if (!previousSubscription) {
      toastifyError("No hay una subscripción activa.");
      return;
    }
    const result = await cancelMySubscription(
      previousSubscription.mpPreapprovalId
    );
    if ("error" in result) {
      toastifyError(result.error);
      return;
    }
    toastifySuccess("Subscripción cancelada con éxito");
    const mongoId = user?.publicMetadata?.mongoId as string | undefined;
    if (mongoId) refreshActiveSubscriptions(mongoId);
    onClose();
  };

  return (
    <div className="flex gap-2 justify-end w-full items-center">
      <Button color="default" variant="light" radius="full" onPress={onClose}>
        Cerrar
      </Button>
      {!isSamePlanSelected && (
        <>
          {isFreePlanSelected && !isFreePlanCurrent && (
            <Suspense fallback={<Spinner color="warning" />}>
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
                sideText="Los anuncios de tu cuenta que sobrepasen el límite de tu plan actual serán ocultados y las relaciones 
                activas que sobrepasen el límite serán marcada como no activas.
                 Puedes ver los anuncios ocultos y elegir las relaciones activas en tu perfil."
              />
            </Suspense>
          )}
          {!isFreePlanSelected && (
            <SecondaryButton
              as={Link}
              target="_blank"
              href={
                !isFreePlanCurrent && previousSubscription
                  ? `/suscribirse/${selectedPlan}/cambiarPlan/${previousSubscription.mpPreapprovalId}`
                  : `/suscribirse/${selectedPlan}`
              }
            >
              Continuar
            </SecondaryButton>
          )}
        </>
      )}
    </div>
  );
};

export default ActionButtons;
