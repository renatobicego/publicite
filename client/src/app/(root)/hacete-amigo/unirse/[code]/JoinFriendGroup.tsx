"use client";

import { Button, Card, CardBody, Link } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaUserGroup } from "react-icons/fa6";

import { joinFriendGroupByInviteCode } from "@/services/friendGroupServices";
import {
  FRIEND_PLAN_WELCOME,
  FriendGroupPublic,
  money,
} from "@/types/friendGroupTypes";
import { FRIEND_PLAN, FRIEND_PLAN_INFO, FRIEND_PLAN_JOIN } from "@/utils/data/urls";
import {
  forgetAfterOnboarding,
  rememberAfterOnboarding,
} from "@/utils/functions/afterOnboarding";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";

/*
Link de invitación a un grupo de Hacete Amigo. Sin cuenta: lleva a registrarse
y vuelve acá al terminar (cookie). Con cuenta: "Sumarme" equivale a aceptar.
*/
export default function JoinFriendGroup({
  code,
  group,
  isSignedIn,
}: {
  code: string;
  group: FriendGroupPublic;
  isSignedIn: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const path = `${FRIEND_PLAN_JOIN}/${code}`;

  useEffect(() => {
    if (isSignedIn) forgetAfterOnboarding();
  }, [isSignedIn]);

  const join = async () => {
    setBusy(true);
    const response = await joinFriendGroupByInviteCode(code);
    setBusy(false);
    if ("error" in response) {
      toastifyError(response.error);
      return;
    }
    toastifySuccess("¡Te sumaste al grupo!");
    router.push(FRIEND_PLAN);
  };

  const tier = group.tierIfJoins;
  let body: React.ReactNode;
  if (group.isMember) {
    body = (
      <Button as={Link} href={FRIEND_PLAN} color="primary" radius="full" className="self-start">
        Ya estás en este grupo: ir al grupo
      </Button>
    );
  } else if (group.availability === "closed") {
    body = (
      <p className="text-sm">
        Este grupo ya está cerrado: ya pagaron o se canceló. Podés armar tu propio
        grupo desde <Link href={FRIEND_PLAN_INFO} size="sm">Hacete Amigo</Link>.
      </p>
    );
  } else if (group.availability === "full") {
    body = <p className="text-sm">Este grupo ya tiene el máximo de miembros.</p>;
  } else if (!isSignedIn) {
    body = (
      <>
        <p className="text-sm">Para sumarte necesitás una cuenta en Soon.</p>
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
      </>
    );
  } else {
    body = (
      <>
        <p className="text-xs text-light-text">
          Es para quien no tiene un plan pago. Para pagar, cada miembro tiene que
          haber publicado un anuncio o una producción.
        </p>
        <Button color="primary" radius="full" className="self-start" isLoading={busy} onPress={join}>
          Sumarme
        </Button>
      </>
    );
  }

  return (
    <Card shadow="md" className="w-full max-w-lg">
      <CardBody className="flex flex-col gap-4 items-start p-6">
        <FaUserGroup className="text-primary size-12" />
        <h1 className="text-2xl font-semibold">
          {group.creatorName ? `${group.creatorName} te invitó` : "Te invitaron"} a
          su grupo de Hacete Amigo
        </h1>
        <p className="text-sm">{FRIEND_PLAN_WELCOME}</p>
        <p className="text-sm">
          Plan: <strong>{group.planReason}</strong>. Ya son {group.acceptedCount}.
          {tier && !group.isMember && group.availability === "open" && (
            <>
              {" "}
              Si te sumás, cada uno paga <strong>{money(tier.pricePerMember)}</strong> por
              mes ({tier.discountPercent} % de descuento).
            </>
          )}
        </p>
        {body}
      </CardBody>
    </Card>
  );
}
