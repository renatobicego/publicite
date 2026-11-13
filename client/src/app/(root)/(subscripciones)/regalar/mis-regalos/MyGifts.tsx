"use client";

import {
  Button,
  Card,
  CardBody,
  Chip,
  Input,
  Link,
  Spinner,
} from "@nextui-org/react";
import { useCallback, useEffect, useState } from "react";
import { FaGift } from "react-icons/fa6";

import {
  activatePlanGift,
  getMyPlanGifts,
  updatePlanGiftEmail,
} from "@/services/planGiftServices";
import {
  monthsLabel,
  PLAN_GIFT_STATUS_COLOR,
  PLAN_GIFT_STATUS_LABEL,
  PlanGift,
} from "@/types/planGiftTypes";
import { GIFT_PLAN } from "@/utils/data/urls";
import { formatPaymentDate } from "@/utils/functions/packs";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import {
  useActiveSubscriptions,
  useUserData,
} from "@/app/(root)/providers/userDataProvider";

const money = (value: number) =>
  `$${value.toLocaleString("es-AR", { maximumFractionDigits: 2 })}`;

/*
Regalos de planes que hizo y que recibió el usuario. El destinatario activa el
regalo desde acá (desde ese momento cuentan los meses); quien regala copia el
link y, mientras nadie lo tomó, puede corregir el email.
*/
export default function MyGifts() {
  const [gifts, setGifts] = useState<{
    given: PlanGift[];
    received: PlanGift[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const response = await getMyPlanGifts();
    if ("error" in response) {
      setError(response.error);
      return;
    }
    setError(null);
    setGifts(response);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <p className="text-sm text-danger">{error}</p>;
  if (!gifts) return <Spinner />;

  return (
    <div className="flex flex-col gap-8 w-full">
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Recibidos</h2>
        {gifts.received.length === 0 ? (
          <p className="text-sm">Todavía no recibiste regalos.</p>
        ) : (
          gifts.received.map((gift) => (
            <ReceivedGiftCard key={gift._id} gift={gift} onChange={load} />
          ))
        )}
      </section>
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">Los que hice</h2>
          <Button as={Link} href={GIFT_PLAN} size="sm" radius="full" color="primary">
            Regalar un plan
          </Button>
        </div>
        {gifts.given.length === 0 ? (
          <p className="text-sm">Todavía no regalaste planes.</p>
        ) : (
          gifts.given.map((gift) => (
            <GivenGiftCard key={gift._id} gift={gift} onChange={load} />
          ))
        )}
      </section>
    </div>
  );
}

function GiftHeader({ gift, title }: { gift: PlanGift; title: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <FaGift className="text-primary size-6" />
      <span className="font-semibold">{title}</span>
      <Chip size="sm" color={PLAN_GIFT_STATUS_COLOR[gift.status]} variant="flat">
        {PLAN_GIFT_STATUS_LABEL[gift.status]}
      </Chip>
    </div>
  );
}

function GiftDates({ gift }: { gift: PlanGift }) {
  if (!gift.expiresAt) return null;
  const until = formatPaymentDate(gift.expiresAt);
  return (
    <p className="text-sm">
      {gift.status === "expired" ? "Terminó el" : "Vigente hasta el"} {until}
    </p>
  );
}

function ReceivedGiftCard({
  gift,
  onChange,
}: {
  gift: PlanGift;
  onChange: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const { refreshActiveSubscriptions } = useActiveSubscriptions();
  const { userIdLogged } = useUserData();

  const activate = async () => {
    setBusy(true);
    const response = await activatePlanGift(gift._id);
    setBusy(false);
    if ("error" in response) {
      toastifyError(response.error);
      return;
    }
    const until = formatPaymentDate(response.expiresAt);
    toastifySuccess(
      until
        ? `Activaste ${gift.planReason}. Vence el ${until}.`
        : `Activaste ${gift.planReason}.`
    );
    if (userIdLogged) refreshActiveSubscriptions(userIdLogged);
    await onChange();
  };

  return (
    <Card shadow="sm">
      <CardBody className="flex flex-col gap-2">
        <GiftHeader
          gift={gift}
          title={`${monthsLabel(gift.months)} de ${gift.planReason}`}
        />
        {gift.giverName && (
          <p className="text-sm">
            Te lo regaló <strong>{gift.giverName}</strong>.
          </p>
        )}
        <GiftDates gift={gift} />
        {gift.canActivate && (
          <div className="flex flex-col gap-1 items-start">
            <p className="text-sm text-light-text">
              Los {monthsLabel(gift.months)} empiezan a contar cuando lo
              activás. Si ya tenés un plan pago, activalo cuando termine o lo
              canceles.
            </p>
            <Button
              color="primary"
              radius="full"
              size="sm"
              isLoading={busy}
              onPress={activate}
            >
              Activar ahora
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function GivenGiftCard({
  gift,
  onChange,
}: {
  gift: PlanGift;
  onChange: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState(gift.recipientEmail ?? "");
  const [busy, setBusy] = useState(false);
  const absoluteLink =
    typeof window !== "undefined" ? `${window.location.origin}${gift.link}` : gift.link;
  const notTakenYet =
    !gift.recipientName && ["paid", "pendingPayment"].includes(gift.status);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(absoluteLink);
      toastifySuccess("Link copiado");
    } catch {
      toastifyError("No se pudo copiar. Copialo a mano.");
    }
  };

  const saveEmail = async () => {
    setBusy(true);
    const response = await updatePlanGiftEmail(gift._id, email.trim());
    setBusy(false);
    if ("error" in response) {
      toastifyError(response.error);
      return;
    }
    toastifySuccess(
      response.recipientName
        ? `Listo: el regalo pasó a la cuenta de ${response.recipientName}.`
        : "Listo: cambiamos el email."
    );
    setEditing(false);
    await onChange();
  };

  const recipient = gift.recipientName ?? gift.recipientEmail ?? "—";

  return (
    <Card shadow="sm">
      <CardBody className="flex flex-col gap-2">
        <GiftHeader
          gift={gift}
          title={`${monthsLabel(gift.months)} de ${gift.planReason}`}
        />
        <p className="text-sm">
          Para <strong>{recipient}</strong> · {money(gift.amount)}
        </p>
        <GiftDates gift={gift} />
        {["paid", "pendingPayment"].includes(gift.status) && (
          <div className="flex flex-wrap gap-2 items-center">
            <code className="text-xs bg-default-100 rounded-lg px-3 py-2 break-all">
              {absoluteLink}
            </code>
            <Button size="sm" radius="full" onPress={copy}>
              Copiar link
            </Button>
          </div>
        )}
        {notTakenYet &&
          (editing ? (
            <div className="flex flex-wrap gap-2 items-end">
              <Input
                type="email"
                label="Email correcto"
                labelPlacement="outside"
                variant="bordered"
                radius="full"
                size="sm"
                className="max-w-xs"
                value={email}
                onValueChange={setEmail}
              />
              <Button size="sm" radius="full" color="primary" isLoading={busy} onPress={saveEmail}>
                Guardar
              </Button>
              <Button size="sm" radius="full" variant="light" onPress={() => setEditing(false)}>
                Cancelar
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="light"
              className="self-start"
              onPress={() => setEditing(true)}
            >
              Corregir el email
            </Button>
          ))}
      </CardBody>
    </Card>
  );
}
