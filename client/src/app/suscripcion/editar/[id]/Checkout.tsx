"use client";

import { editPayment } from "@/services/subscriptionServices";
import { useUser } from "@clerk/nextjs";
import { CardPayment, initMercadoPago } from "@mercadopago/sdk-react";
import { ICardPaymentBrickPayer } from "@mercadopago/sdk-react/bricks/cardPayment/type";

initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY as string);

type CheckoutProps = {
  subscription: any
}

const Checkout = ({subscription} : CheckoutProps) => {
  const { user, isLoaded } = useUser();
  const initialization: { amount: number; payer: ICardPaymentBrickPayer } = {
    amount: subscription.auto_recurring.transaction_amount,
    payer: {
      email: user?.emailAddresses[0].emailAddress,
    },
  };

  const onSubmit = async (formData: any) => {
    await editPayment(formData, subscription);
  };

  const onError = async (error: any) => {
    // callback llamado para todos los casos de error de Brick
    console.log(error);
  };

  const onReady = async () => {
    /*
        Callback llamado cuando Brick está listo.
        Aquí puedes ocultar cargamentos de su sitio, por ejemplo.
      */
  };
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
        visual: {
          texts: {
            formSubmit: "Verificar Método"  
          }
        }
      }}
    />
  );
};

export default Checkout;
