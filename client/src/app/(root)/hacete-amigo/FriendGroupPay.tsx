"use client";

import { useUser } from "@clerk/nextjs";
import CardPaymentBrick from "@/components/payments/CardPaymentBrick";

import { payFriendGroup } from "@/services/friendGroupServices";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";

/*
Pago del grupo con el Brick de tarjeta: el server crea el débito automático por
el total del grupo (el monto lo decide el server, acá sólo se muestra).
*/
export default function FriendGroupPay({
  groupId,
  totalAmount,
  onPaid,
}: {
  groupId: string;
  totalAmount: number;
  onPaid: () => void;
}) {
  const { user } = useUser();

  const onSubmit = async (formData: any) => {
    const response = await payFriendGroup({
      groupId,
      cardTokenId: formData.token,
      payerEmail:
        formData?.payer?.email ?? user?.emailAddresses[0]?.emailAddress ?? "",
    });
    if ("error" in response) {
      toastifyError(response.error);
      return;
    }
    toastifySuccess(response.message);
    onPaid();
  };

  return (
    <CardPaymentBrick
      key={`${groupId}-${totalAmount}`}
      initialization={{
        amount: totalAmount,
        payer: { email: user?.emailAddresses[0]?.emailAddress },
      }}
      onSubmit={onSubmit}
      onError={(error: any) => toastifyError(String(error?.message ?? error))}
      customization={{ paymentMethods: { maxInstallments: 1 } }}
    />
  );
}
