"use client";

import { Button, Card, CardBody, Link } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { FaGift } from "react-icons/fa6";

import GiftActivatedCelebration from "@/components/planGift/GiftActivatedCelebration";
import { activatePlanGift, claimPlanGift } from "@/services/planGiftServices";
import { monthsLabel, PlanGiftPublic } from "@/types/planGiftTypes";
import { MY_PLAN_GIFTS, REDEEM_GIFT } from "@/utils/data/urls";
import {
  forgetAfterOnboarding,
  rememberAfterOnboarding,
} from "@/utils/functions/afterOnboarding";
import { formatPaymentDate } from "@/utils/functions/packs";
import { toastifyError } from "@/utils/functions/toastify";

/*
Link del regalo. Sin cuenta: muestra qué es y lleva a registrarse (al terminar
el onboarding vuelve acá). Con la cuenta del destinatario: lo toma (queda en
"Mis regalos") y se puede activar en el momento.
*/
export default function RedeemGift({
  gift,
  isSignedIn,
}: {
  gift: PlanGiftPublic;
  isSignedIn: boolean;
}) {
  const path = `${REDEEM_GIFT}/${gift.code}`;
  const [claimed, setClaimed] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [activatedUntil, setActivatedUntil] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  const title = `${monthsLabel(gift.months)} de ${gift.planReason}`;

  // Ya volvió del registro: se borra la cookie. Si es para esta cuenta, lo toma.
  useEffect(() => {
    if (!isSignedIn) return;
    forgetAfterOnboarding();
    if (!gift.isForViewer || gift.availability !== "available") return;
    claimPlanGift(gift.code).then((response) => {
      if ("error" in response) {
        setClaimError(response.error);
        return;
      }
      setClaimed(true);
    });
  }, [isSignedIn, gift.code, gift.isForViewer, gift.availability]);

  const activate = async () => {
    if (!gift.giftId) return;
    setBusy(true);
    const response = await activatePlanGift(gift.giftId);
    setBusy(false);
    if ("error" in response) {
      toastifyError(response.error);
      return;
    }
    setActivatedUntil(formatPaymentDate(response.expiresAt) ?? "");
    setCelebrating(true);
  };

  const authLinks = (
    <div className="flex flex-wrap gap-2">
      <Button
        as={Link}
        color="primary"
        radius="full"
        href={`/registrarse?redirect_url=${encodeURIComponent(path)}`}
        onPress={() => rememberAfterOnboarding(path)}
      >
        Crear mi cuenta
      </Button>
      <Button
        as={Link}
        radius="full"
        variant="bordered"
        href={`/iniciar-sesion?redirect_url=${encodeURIComponent(path)}`}
        onPress={() => rememberAfterOnboarding(path)}
      >
        Ya tengo cuenta
      </Button>
    </div>
  );

  let body: React.ReactNode;
  if (gift.availability === "used") {
    body = <p className="text-sm">Este regalo ya se activó.</p>;
  } else if (gift.availability === "unavailable") {
    body = (
      <p className="text-sm">
        Este regalo todavía no está disponible: el pago puede estar en proceso.
        Probá de nuevo en un rato.
      </p>
    );
  } else if (!isSignedIn) {
    body = (
      <>
        <p className="text-sm">
          {gift.reservedForEmail
            ? `Es para la cuenta con el email ${gift.reservedForEmail}. Registrate (o entrá) con ese email y el regalo aparece en tu cuenta.`
            : "Entrá con tu cuenta para verlo."}
        </p>
        {authLinks}
      </>
    );
  } else if (!gift.isForViewer) {
    body = (
      <p className="text-sm">
        Este regalo es para otra cuenta
        {gift.reservedForEmail ? ` (${gift.reservedForEmail})` : ""}. Si es
        para vos, entrá con la cuenta de ese email o pedile a quien te lo
        regaló que corrija el email.
      </p>
    );
  } else if (activatedUntil !== null) {
    body = (
      <>
        <p className="text-sm">
          ¡Listo! Tu plan quedó activo{activatedUntil ? ` hasta el ${activatedUntil}` : ""}.
        </p>
        <Button as={Link} href="/" radius="full" color="primary" className="self-start">
          Empezar a usarlo
        </Button>
      </>
    );
  } else if (claimError) {
    body = <p className="text-sm text-danger">{claimError}</p>;
  } else {
    body = (
      <>
        <p className="text-sm">
          Los {monthsLabel(gift.months)} empiezan a contar cuando lo activás.
          Podés activarlo ahora o más tarde desde{" "}
          <Link href={MY_PLAN_GIFTS} size="sm">
            Mis regalos
          </Link>
          . Si ya tenés un plan pago, activalo cuando termine o lo canceles.
        </p>
        <Button
          color="primary"
          radius="full"
          className="self-start"
          isLoading={busy}
          isDisabled={!claimed}
          onPress={activate}
        >
          Activar ahora
        </Button>
      </>
    );
  }

  return (
    <>
      <GiftActivatedCelebration
        open={celebrating}
        planName={gift.planReason}
        until={activatedUntil || null}
        giverName={gift.giverName}
        actionHref="/"
        onClose={() => setCelebrating(false)}
      />
      <Card shadow="md" className="w-full max-w-lg">
        <CardBody className="flex flex-col gap-4 items-start p-6">
          <FaGift className="text-primary size-12" />
          <h1 className="text-2xl font-semibold">
            {gift.giverName ? `${gift.giverName} te regaló` : "Te regalaron"}{" "}
            {title}
          </h1>
          {body}
        </CardBody>
      </Card>
    </>
  );
}
