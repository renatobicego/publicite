"use client";

import { processPayment } from "@/services/subscriptionServices";
import { toastifyError } from "@/utils/functions/toastify";
import { useUser } from "@clerk/nextjs";
import { CardPayment, initMercadoPago } from "@mercadopago/sdk-react";
import { ICardPaymentBrickPayer } from "@mercadopago/sdk-react/bricks/cardPayment/type";

initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY as string);

type CheckoutProps = {
  subscriptionPlan: any
}

const Checkout = ({subscriptionPlan} : CheckoutProps) => {
  const { user, isLoaded } = useUser();
  const initialization: { amount: number; payer: ICardPaymentBrickPayer } = {
    amount: subscriptionPlan.auto_recurring.transaction_amount,
    payer: {
      email: user?.emailAddresses[0].emailAddress,
    }
  };

  const onSubmit = async (formData: any, additionalData: any) => {
    const res = await processPayment(formData, subscriptionPlan, user?.id as string);
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
