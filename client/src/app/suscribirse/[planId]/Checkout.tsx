"use client";

import {
  editSubscription,
  processPayment,
} from "@/services/subscriptionServices";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { useUser } from "@clerk/nextjs";
import { CardPayment, initMercadoPago } from "@mercadopago/sdk-react";
import { ICardPaymentBrickPayer } from "@mercadopago/sdk-react/bricks/cardPayment/type";
import { useRouter } from "next/navigation";

initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY as string);

type CheckoutProps = {
  subscriptionPlan: any;
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

  const onSubmit = async (formData: any, additionalData: any) => {
    const res = await processPayment(
      formData,
      subscriptionPlan,
      user?.publicMetadata?.mongoId as string
    );
    if ("error" in res) {
      toastifyError(res.error as string);
      return;
    }
    if (previousSubscriptionId) {
      editSubscription(previousSubscriptionId, { status: "cancelled" })
        .then(() => {
          toastifySuccess("Subscripción anterior cancelada con éxito");
          router.replace("/suscribirse/suscripcion-actualizada");
        })
        .catch(() =>
          toastifyError(
            "Error al cancelar la subscripción anterior. Por favor, contacta a soporte"
          )
        );
    } else {
      router.replace("/suscribirse/suscripcion-exitosa");
    }
  };

  const onError = async (error: any) => {
    // callback llamado para todos los casos de error de Brick
    toastifyError(error);
  };

  // const onReady = async () => {
  // };
  if (!isLoaded) return null;
  return (
    <CardPayment
      initialization={initialization}
      key={"cardPaymentBrick"}
      onSubmit={onSubmit}
      // onReady={onReady}
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
