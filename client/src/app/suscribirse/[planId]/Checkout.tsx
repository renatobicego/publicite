"use client";

import { startSubscriptionCheckout } from "@/services/subscriptionServices";
import {
  toastifyError,
  toastifySuccess,
  toastifyWarn,
} from "@/utils/functions/toastify";
import { useUser } from "@clerk/nextjs";
import { CardPayment, initMercadoPago } from "@mercadopago/sdk-react";
import { ICardPaymentBrickPayer } from "@mercadopago/sdk-react/bricks/cardPayment/type";
import { useRouter } from "next/navigation";

initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY as string);

type CheckoutProps = {
  subscriptionPlan: any;
  /** mpPreapprovalId del plan actual, cuando es un cambio de plan. */
  previousSubscriptionId?: string;
};

const Checkout = ({
  subscriptionPlan,
  previousSubscriptionId,
}: CheckoutProps) => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const initialization: { amount: number; payer: ICardPaymentBrickPayer } = {
    amount: subscriptionPlan.auto_recurring.transaction_amount,
    payer: {
      email: user?.emailAddresses[0].emailAddress,
    },
  };

  /*
  El alta (y en un cambio de plan, la baja del anterior) la hace el server en un
  solo paso: acá sólo se manda el plan elegido y el token de la tarjeta. Si el
  server no puede dar de baja el plan anterior, el nuevo igual quedó activo y se
  avisa con el mensaje que devuelve.
  */
  const onSubmit = async (formData: any) => {
    const result = await startSubscriptionCheckout({
      mpPreapprovalPlanId: subscriptionPlan.id,
      cardTokenId: formData.token,
      payerEmail: formData.payer?.email ?? user?.emailAddresses[0].emailAddress,
      replacesSubscriptionId: previousSubscriptionId,
    });
    if ("error" in result) {
      toastifyError(result.error);
      return;
    }
    if (result.warning) toastifyWarn(result.warning);
    if (previousSubscriptionId) {
      if (result.previousSubscriptionCancelled) {
        toastifySuccess("Cambiaste de plan con éxito");
      }
      router.replace("/suscribirse/suscripcion-actualizada");
    } else {
      router.replace("/suscribirse/suscripcion-exitosa");
    }
  };

  const onError = async (error: any) => {
    // callback llamado para todos los casos de error de Brick
    toastifyError(error);
  };

  const onReady = async () => {};
  if (!isLoaded) return null;
  return (
    <CardPayment
      initialization={initialization}
      key={"cardPaymentBrick"}
      onSubmit={onSubmit}
      onReady={onReady}
      onError={onError}
      locale="es-AR"
      customization={{
        paymentMethods: {
          maxInstallments: 1,
        },
      }}
    />
  );
};

export default Checkout;
