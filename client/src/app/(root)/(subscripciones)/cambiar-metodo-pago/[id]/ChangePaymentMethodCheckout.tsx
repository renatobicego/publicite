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

type ChangePaymentMethodCheckoutProps = {
  subscriptionId: string;
};

const ChangePaymentMethodCheckout = ({
  subscriptionId,
}: ChangePaymentMethodCheckoutProps) => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const initialization: { amount: number; payer: ICardPaymentBrickPayer } = {
    amount: 0,
    payer: {
      email: user?.emailAddresses[0].emailAddress,
    },
  };

  const onSubmit = async (formData: any, additionalData: any) => {
    editSubscription(subscriptionId, {
      card_token_id: formData.token,
    })
      .then(() => {
        toastifySuccess("Subscripción anterior cancelada con éxito");
        router.replace("/suscribirse/suscripcion-actualizada");
      })
      .catch(() =>
        toastifyError(
          "Error al editar la subscripción. Por favor, intenta de nuevo o contacta a soporte"
        )
      );
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

export default ChangePaymentMethodCheckout;
