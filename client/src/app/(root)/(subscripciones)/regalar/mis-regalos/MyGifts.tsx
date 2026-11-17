"use client";

import { Button, Input, Link, Spinner, Tab, Tabs } from "@nextui-org/react";
import { useCallback, useEffect, useState } from "react";
import { FaGift, FaPaperPlane } from "react-icons/fa6";

import {
  activatePlanGift,
  getMyPlanGifts,
  updatePlanGiftEmail,
} from "@/services/planGiftServices";
import {
  monthsLabel,
  PLAN_GIFT_STATUS_LABEL,
  PlanGift,
} from "@/types/planGiftTypes";
import { GIFT_PLAN } from "@/utils/data/urls";
import { GiftMockRefund } from "@/components/payments/MpMockActions";
import GiftActivatedCelebration from "@/components/planGift/GiftActivatedCelebration";
import GiftCard, { GiftCardRow } from "@/components/planGift/GiftCard";
import GiftCube from "@/components/planGift/GiftCube";
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
  // null = todavía no eligió solapa (se decide según lo que tenga).
  const [tab, setTab] = useState<GiftTab | null>(null);

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

  // Arranca en "Recibidos", salvo que no tenga ninguno y sí haya regalado.
  const selected: GiftTab =
    tab ?? (gifts.received.length === 0 && gifts.given.length > 0 ? "hechos" : "recibidos");
  const readyToActivate = gifts.received.filter((gift) => gift.canActivate).length;

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          aria-label="Regalos recibidos y hechos"
          radius="full"
          color="primary"
          selectedKey={selected}
          onSelectionChange={(key) => setTab(key as GiftTab)}
        >
          <Tab
            key="recibidos"
            title={
              <TabTitle
                icon={<FaGift />}
                label="Recibidos"
                count={gifts.received.length}
                highlight={readyToActivate > 0}
              />
            }
          />
          <Tab
            key="hechos"
            title={<TabTitle icon={<FaPaperPlane />} label="Los que hice" count={gifts.given.length} />}
          />
        </Tabs>
        <Button as={Link} href={GIFT_PLAN} size="sm" radius="full" color="primary">
          Regalar un plan
        </Button>
      </div>

      {selected === "recibidos" &&
        (gifts.received.length === 0 ? (
          <EmptyGifts text="Todavía no recibiste regalos. Cuando alguien te regale un plan, lo vas a ver acá para activarlo." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 items-start">
            {gifts.received.map((gift) => (
              <ReceivedGiftCard key={gift._id} gift={gift} onChange={load} />
            ))}
          </div>
        ))}

      {selected === "hechos" &&
        (gifts.given.length === 0 ? (
          <EmptyGifts text="Todavía no regalaste planes. Regalale meses de un plan a quien quieras: pagás una sola vez." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 items-start">
            {gifts.given.map((gift) => (
              <GivenGiftCard key={gift._id} gift={gift} onChange={load} />
            ))}
          </div>
        ))}
    </div>
  );
}

type GiftTab = "recibidos" | "hechos";

/** Título de una solapa: ícono, nombre y cantidad (resaltada si hay algo para activar). */
function TabTitle({
  icon,
  label,
  count,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span>{label}</span>
      {count > 0 && (
        <span
          className={`min-w-5 h-5 px-1.5 rounded-full text-xs font-semibold flex items-center justify-center ${
            highlight ? "bg-[#FFC93C] text-[#6B4A00]" : "bg-default-200 text-default-700"
          }`}
        >
          {count}
        </span>
      )}
    </div>
  );
}

function EmptyGifts({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-default-300 px-6 py-10 text-center">
      <div className="size-20 rounded-full bg-primary/10 p-3">
        <GiftCube />
      </div>
      <p className="text-sm text-light-text max-w-sm">{text}</p>
    </div>
  );
}

/** Los regalos que ya no sirven se ven en gris. */
const isDimmed = (gift: PlanGift) =>
  ["expired", "refunded", "rejected"].includes(gift.status);

/** Fila de vigencia: "Vigente hasta" / "Terminó el", si ya se activó. */
function dateRows(gift: PlanGift): GiftCardRow[] {
  if (!gift.expiresAt) return [];
  const until = formatPaymentDate(gift.expiresAt);
  if (!until) return [];
  return [{ label: gift.status === "expired" ? "Terminó el" : "Vigente hasta", value: until }];
}

function ReceivedGiftCard({
  gift,
  onChange,
}: {
  gift: PlanGift;
  onChange: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  // Fecha de vencimiento del regalo recién activado: mientras no es null, se festeja.
  const [celebrateUntil, setCelebrateUntil] = useState<string | null>(null);
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
    setCelebrateUntil(formatPaymentDate(response.expiresAt) ?? "");
    if (userIdLogged) refreshActiveSubscriptions(userIdLogged);
    await onChange();
  };

  return (
    <>
    <GiftActivatedCelebration
      open={celebrateUntil !== null}
      planName={gift.planReason}
      until={celebrateUntil || null}
      giverName={gift.giverName}
      onClose={() => setCelebrateUntil(null)}
    />
    <GiftCard
      planName={gift.planReason}
      months={gift.months}
      badge={PLAN_GIFT_STATUS_LABEL[gift.status]}
      happy={gift.status === "active"}
      dimmed={isDimmed(gift)}
      rows={[{ label: "De", value: gift.giverName ?? "Alguien" }, ...dateRows(gift)]}
    >
      <ReceivedGiftFooter gift={gift} busy={busy} onActivate={activate} />
    </GiftCard>
    </>
  );
}

function ReceivedGiftFooter({
  gift,
  busy,
  onActivate,
}: {
  gift: PlanGift;
  busy: boolean;
  onActivate: () => void;
}) {
  if (gift.canActivate) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-white/90">
          Los {monthsLabel(gift.months)} empiezan a contar cuando lo activás.
        </p>
        <Button
          radius="full"
          className="bg-white text-primary font-semibold"
          isLoading={busy}
          onPress={onActivate}
        >
          Activar ahora
        </Button>
      </div>
    );
  }
  const text: Partial<Record<PlanGift["status"], string>> = {
    paid: "Ya tenés un plan. Activalo cuando termine o lo canceles.",
    pendingPayment: "El pago todavía está en proceso.",
    active: "Ya lo estás usando.",
    expired: "Este regalo ya terminó.",
    refunded: "Este regalo se devolvió.",
    rejected: "El pago de este regalo fue rechazado.",
  };
  return <p className="text-sm text-white/90">{text[gift.status]}</p>;
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
    <div className="flex flex-col gap-3">
      <GiftCard
        planName={gift.planReason}
        months={gift.months}
        badge={PLAN_GIFT_STATUS_LABEL[gift.status]}
        happy={gift.status === "active"}
        dimmed={isDimmed(gift)}
        rows={[
          { label: "Para", value: recipient },
          { label: "De", value: "Vos" },
          ...dateRows(gift),
        ]}
      >
        <div className="flex items-end justify-between">
          <span className="text-sm text-white/85">Pago único</span>
          <span className="text-2xl font-bold">{money(gift.amount)}</span>
        </div>
        {["paid", "pendingPayment"].includes(gift.status) && (
          <Button
            size="sm"
            radius="full"
            className="mt-3 w-full bg-white text-primary font-semibold"
            onPress={copy}
          >
            Copiar el link del regalo
          </Button>
        )}
      </GiftCard>
      {["paid", "active"].includes(gift.status) && (
        <GiftMockRefund giftId={gift._id} onDone={onChange} />
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
    </div>
  );
}
