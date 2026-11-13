"use client";

import ErrorCard from "@/components/ErrorCard";
import { updateMySubscriptionCard } from "@/services/subscriptionServices";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { useUser } from "@clerk/nextjs";
import { CardPayment, initMercadoPago } from "@mercadopago/sdk-react";
import { ICardPaymentBrickPayer } from "@mercadopago/sdk-react/bricks/cardPayment/type";
import { useRouter } from "next/navigation";

initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY as string);

type ChangePaymentMethodCheckoutProps = {
  subscriptionId: string;
  amount?: number;
};

const ChangePaymentMethodCheckout = ({
  subscriptionId,
  amount,
}: ChangePaymentMethodCheckoutProps) => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  if (!amount)
    return (
      <ErrorCard message="Error al traer los datos de la suscripción actual. Por favor, intente de nuevo." />
    );
  const initialization: { amount: number; payer: ICardPaymentBrickPayer } = {
    amount,
    payer: {
      email: user?.emailAddresses[0].emailAddress,
    },
  };

  // El server valida que la suscripción sea del usuario antes de cambiar la tarjeta.
  const onSubmit = async (formData: any) => {
    const result = await updateMySubscriptionCard(
      subscriptionId,
      formData.token
    );
    if ("error" in result) {
      toastifyError(result.error);
      return;
    }
    toastifySuccess("Método de pago actualizado con éxito");
    router.replace("/suscribirse/suscripcion-actualizada");
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
