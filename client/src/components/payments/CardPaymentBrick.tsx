"use client";

import { Button, Card, CardBody, Input, Radio, RadioGroup } from "@nextui-org/react";
import { CardPayment, initMercadoPago } from "@mercadopago/sdk-react";
import { useState } from "react";

import { isMpMock } from "@/utils/functions/mpMock";

/*
Formulario de tarjeta de MercadoPago (Card Payment Brick). En desarrollo local
con NEXT_PUBLIC_MP_MOCK=true muestra un formulario simulado: no carga MercadoPago
ni pide tarjeta, y manda un token falso que el server simulado entiende
(`mock_APRO` aprueba, `mock_OTHE` rechaza).
*/

let initialized = false;
const ensureMercadoPago = () => {
  if (initialized) return;
  initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY as string);
  initialized = true;
};

export interface CardPaymentBrickProps {
  initialization: { amount: number; payer?: { email?: string } };
  onSubmit: (formData: any) => Promise<void> | void;
  onError?: (error: any) => void;
  onReady?: () => void;
  customization?: Record<string, any>;
}

export default function CardPaymentBrick(props: CardPaymentBrickProps) {
  if (isMpMock()) return <MockCardPayment {...props} />;
  ensureMercadoPago();
  return (
    <CardPayment
      initialization={props.initialization}
      onSubmit={async (formData) => {
        await props.onSubmit(formData);
      }}
      onError={props.onError ?? (() => undefined)}
      onReady={props.onReady}
      locale="es-AR"
      customization={props.customization ?? { paymentMethods: { maxInstallments: 1 } }}
    />
  );
}

function MockCardPayment({ initialization, onSubmit }: CardPaymentBrickProps) {
  const [email, setEmail] = useState(initialization.payer?.email ?? "");
  const [outcome, setOutcome] = useState<"APRO" | "OTHE">("APRO");
  const [busy, setBusy] = useState(false);

  const pay = async () => {
    setBusy(true);
    try {
      await onSubmit({
        token: `mock_${outcome}`,
        payment_method_id: "visa",
        issuer_id: undefined,
        installments: 1,
        payer: {
          email,
          identification: { type: "DNI", number: "12345678" },
        },
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card shadow="sm" className="border-2 border-dashed border-warning w-full">
      <CardBody className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-warning-600">
          MercadoPago simulado (sólo local): no se cobra nada.
        </p>
        <p className="text-sm">
          Monto: <strong>${initialization.amount.toLocaleString("es-AR")}</strong>
        </p>
        <Input
          size="sm"
          label="Email de quien paga"
          value={email}
          onValueChange={setEmail}
        />
        <RadioGroup
          label="Resultado del pago"
          orientation="horizontal"
          value={outcome}
          onValueChange={(value) => setOutcome(value as "APRO" | "OTHE")}
        >
          <Radio value="APRO">Aprobado</Radio>
          <Radio value="OTHE">Rechazado</Radio>
        </RadioGroup>
        <Button color="primary" radius="full" isLoading={busy} onPress={pay}>
          Pagar (simulado)
        </Button>
      </CardBody>
    </Card>
  );
}
