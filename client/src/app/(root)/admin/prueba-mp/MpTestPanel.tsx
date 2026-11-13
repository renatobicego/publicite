"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Input,
  Tab,
  Tabs,
} from "@nextui-org/react";
import { CardPayment, initMercadoPago } from "@mercadopago/sdk-react";
import { useUser } from "@clerk/nextjs";

import {
  MpTestEvent,
  mpTestCreatePayment,
  mpTestCreatePreapproval,
  mpTestEvents,
  mpTestGetPreapproval,
  mpTestSetPreapprovalStatus,
} from "@/services/mpTestServices";
import { toastifyError } from "@/utils/functions/toastify";

initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY as string);

type Mode = "preapproval" | "payment";

/*
Herramienta de la Fase 0: prueba con MercadoPago la suscripción SIN plan
asociado (la que usa Hacete Amigo) y el pago único (el de los regalos). Todo va
con external_reference mptest:, así el webhook lo guarda aparte sin tocar
usuarios ni planes. Son cobros reales: después se cancelan y se devuelven
desde el panel de MercadoPago. Se borra al terminar las pruebas.
*/
export default function MpTestPanel() {
  const { user } = useUser();
  const [mode, setMode] = useState<Mode>("preapproval");
  const [amount, setAmount] = useState("100");
  const [brickAmount, setBrickAmount] = useState(100);
  const [result, setResult] = useState<string>("");
  const [preapprovalId, setPreapprovalId] = useState("");
  const [events, setEvents] = useState<MpTestEvent[]>([]);
  const [openEvent, setOpenEvent] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const showResult = (response: { json: string } | { error: string }) => {
    if ("error" in response) {
      toastifyError(response.error);
      setResult(JSON.stringify(response, null, 2));
      return null;
    }
    setResult(response.json);
    try {
      return JSON.parse(response.json);
    } catch {
      return null;
    }
  };

  const loadEvents = useCallback(async () => {
    const response = await mpTestEvents();
    if ("error" in response) {
      toastifyError(response.error);
      return;
    }
    setEvents(response.events);
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const onSubmit = async (formData: any) => {
    setBusy(true);
    try {
      const email =
        formData?.payer?.email ?? user?.emailAddresses[0]?.emailAddress ?? "";
      if (mode === "preapproval") {
        const parsed = showResult(
          await mpTestCreatePreapproval(brickAmount, formData.token, email)
        );
        if (parsed?.id) setPreapprovalId(parsed.id);
      } else {
        showResult(
          await mpTestCreatePayment({
            amount: brickAmount,
            cardTokenId: formData.token,
            payerEmail: email,
            paymentMethodId: formData.payment_method_id,
            issuerId: formData.issuer_id ? String(formData.issuer_id) : undefined,
            identificationType: formData?.payer?.identification?.type,
            identificationNumber: formData?.payer?.identification?.number,
          })
        );
      }
      await loadEvents();
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = async (
    status: "paused" | "authorized" | "cancelled" | "canceled"
  ) => {
    if (!preapprovalId) return;
    setBusy(true);
    showResult(await mpTestSetPreapprovalStatus(preapprovalId, status));
    setBusy(false);
    await loadEvents();
  };

  const consult = async () => {
    if (!preapprovalId) return;
    setBusy(true);
    showResult(await mpTestGetPreapproval(preapprovalId));
    setBusy(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardBody className="flex flex-col gap-2 text-sm">
          <h2 className="text-lg font-semibold">Prueba de MercadoPago</h2>
          <p>
            Prueba la <strong>suscripción sin plan</strong> (la que usa Hacete
            Amigo) y el <strong>pago único</strong> (el de los regalos). Todo
            sale con referencia <code>mptest:</code>: el webhook lo guarda en la
            tabla de abajo y no toca usuarios ni planes.
          </p>
          <p>
            <strong>Son cobros reales.</strong> Al terminar, cancelá las
            suscripciones con los botones y devolvé los cobros desde el panel de
            MercadoPago. El monto tiene que ser de más de $50 (lo que es menos el
            webhook lo toma como validación de tarjeta) y de hasta $5.000.
          </p>
        </CardBody>
      </Card>

      <div className="flex flex-col gap-4 lg:flex-row">
        <Card className="flex-1">
          <CardBody className="flex flex-col gap-4">
            <Tabs
              aria-label="Tipo de prueba"
              selectedKey={mode}
              onSelectionChange={(key) => setMode(key as Mode)}
            >
              <Tab key="preapproval" title="Suscripción sin plan" />
              <Tab key="payment" title="Pago único" />
            </Tabs>
            <div className="flex items-end gap-2">
              <Input
                label="Monto (ARS)"
                type="number"
                value={amount}
                onValueChange={setAmount}
                className="max-w-[12rem]"
              />
              <Button
                variant="flat"
                onPress={() => {
                  const value = Number(amount);
                  if (Number.isFinite(value) && value > 0) setBrickAmount(value);
                }}
              >
                Usar este monto
              </Button>
            </div>
            <CardPayment
              key={`${mode}-${brickAmount}`}
              initialization={{
                amount: brickAmount,
                payer: { email: user?.emailAddresses[0]?.emailAddress },
              }}
              onSubmit={onSubmit}
              onError={(error: any) => toastifyError(String(error?.message ?? error))}
              locale="es-AR"
              customization={{ paymentMethods: { maxInstallments: 1 } }}
            />
          </CardBody>
        </Card>

        <Card className="flex-1">
          <CardBody className="flex flex-col gap-3">
            <Input
              label="Id del preapproval de prueba"
              value={preapprovalId}
              onValueChange={setPreapprovalId}
            />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" isDisabled={busy || !preapprovalId} onPress={consult}>
                Consultar
              </Button>
              <Button
                size="sm"
                isDisabled={busy || !preapprovalId}
                onPress={() => changeStatus("paused")}
              >
                Pausar
              </Button>
              <Button
                size="sm"
                isDisabled={busy || !preapprovalId}
                onPress={() => changeStatus("authorized")}
              >
                Reactivar
              </Button>
              <Button
                size="sm"
                color="danger"
                variant="flat"
                isDisabled={busy || !preapprovalId}
                onPress={() => changeStatus("cancelled")}
              >
                Cancelar (cancelled)
              </Button>
              <Button
                size="sm"
                color="danger"
                variant="flat"
                isDisabled={busy || !preapprovalId}
                onPress={() => changeStatus("canceled")}
              >
                Cancelar (canceled)
              </Button>
            </div>
            <p className="text-xs text-light-text">Respuesta de MercadoPago:</p>
            <pre className="text-xs bg-fondo rounded-lg p-3 overflow-auto max-h-96 whitespace-pre-wrap break-all">
              {result || "Todavía no hay respuesta."}
            </pre>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Eventos que llegaron por webhook</h3>
            <Button size="sm" variant="flat" onPress={loadEvents}>
              Actualizar
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-light-text">
                  <th className="p-2">Hora</th>
                  <th className="p-2">Topic</th>
                  <th className="p-2">Acción</th>
                  <th className="p-2">Id</th>
                  <th className="p-2">Estado</th>
                  <th className="p-2">Monto</th>
                  <th className="p-2">Referencia</th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 && (
                  <tr>
                    <td className="p-2" colSpan={7}>
                      Todavía no llegó ningún evento de prueba.
                    </td>
                  </tr>
                )}
                {events.map((event) => (
                  <Fragment key={event._id}>
                    <tr
                      className="border-t border-divider cursor-pointer hover:bg-fondo"
                      onClick={() =>
                        setOpenEvent(openEvent === event._id ? null : event._id)
                      }
                    >
                      <td className="p-2 whitespace-nowrap">
                        {new Date(event.receivedAt).toLocaleString("es-AR")}
                      </td>
                      <td className="p-2">{event.topic}</td>
                      <td className="p-2">{event.action}</td>
                      <td className="p-2">{event.dataId}</td>
                      <td className="p-2">{event.status}</td>
                      <td className="p-2">{event.amount}</td>
                      <td className="p-2 break-all">{event.externalReference}</td>
                    </tr>
                    {openEvent === event._id && (
                      <tr>
                        <td colSpan={7} className="p-2">
                          <pre className="bg-fondo rounded-lg p-3 overflow-auto max-h-96 whitespace-pre-wrap break-all">
                            {event.payload}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
