"use client";

import {
  Avatar,
  Button,
  Card,
  CardBody,
  Chip,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  useDisclosure,
} from "@nextui-org/react";
import { useCallback, useEffect, useState } from "react";
import { FaUserGroup } from "react-icons/fa6";

import UserPicker from "@/components/inputs/UserPicker";
import {
  getFriendGroupCheckout,
  getMyFriendGroup,
  inviteToFriendGroup,
  leaveFriendGroup,
  regenerateFriendGroupInviteCode,
  removeFriendGroupMember,
  respondFriendGroupInvitation,
} from "@/services/friendGroupServices";
import {
  FRIEND_GROUP_STATUS_COLOR,
  FRIEND_GROUP_STATUS_LABEL,
  FriendGroup,
  FriendGroupInvitation,
  FriendGroupPricing,
  money,
  MyFriendGroup,
} from "@/types/friendGroupTypes";
import { FRIEND_PLAN_INFO, FRIEND_PLAN_JOIN } from "@/utils/data/urls";
import { formatPaymentDate } from "@/utils/functions/packs";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import {
  useActiveSubscriptions,
  useUserData,
} from "@/app/(root)/providers/userDataProvider";
import { User } from "@/types/userTypes";
import FriendGroupPayLoader from "./FriendGroupPayLoader";
import { FriendGroupMockActions } from "@/components/payments/MpMockActions";

/*
Panel de Hacete Amigo: el grupo del usuario (miembros, invitar, link, resumen
del precio, pagar, salir) o, si no tiene grupo, sus invitaciones.
*/
export default function FriendGroupPanel() {
  const [data, setData] = useState<MyFriendGroup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { refreshActiveSubscriptions } = useActiveSubscriptions();
  const { userIdLogged } = useUserData();

  const load = useCallback(async () => {
    const response = await getMyFriendGroup();
    if ("error" in response) {
      setError(response.error);
      return;
    }
    setError(null);
    setData(response);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const reloadWithLimits = async () => {
    await load();
    if (userIdLogged) refreshActiveSubscriptions(userIdLogged);
  };

  if (error) return <p className="text-sm text-danger">{error}</p>;
  if (!data) return <Spinner />;

  if (!data.group) {
    return (
      <div className="flex flex-col gap-6 w-full">
        {data.invitations.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold">Te invitaron</h2>
            {data.invitations.map((invitation) => (
              <InvitationCard
                key={invitation.groupId}
                invitation={invitation}
                onChange={reloadWithLimits}
              />
            ))}
          </section>
        )}
        <Card shadow="sm">
          <CardBody className="flex flex-col gap-3 items-start">
            <p className="text-sm">
              Todavía no estás en un grupo de Hacete Amigo. Armá uno con tus
              amigos y paguen menos.
            </p>
            <Button as={Link} href={FRIEND_PLAN_INFO} color="primary" radius="full">
              Ver cómo funciona
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return <GroupView group={data.group} onChange={reloadWithLimits} />;
}

function InvitationCard({
  invitation,
  onChange,
}: {
  invitation: FriendGroupInvitation;
  onChange: () => Promise<void>;
}) {
  const [busy, setBusy] = useState<"accept" | "reject" | null>(null);

  const respond = async (accept: boolean) => {
    setBusy(accept ? "accept" : "reject");
    const response = await respondFriendGroupInvitation(invitation.groupId, accept);
    setBusy(null);
    if ("error" in response) {
      toastifyError(response.error);
      return;
    }
    toastifySuccess(accept ? "¡Te sumaste al grupo!" : "Rechazaste la invitación.");
    await onChange();
  };

  return (
    <Card shadow="sm">
      <CardBody className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <FaUserGroup className="text-primary size-5" />
          <span className="font-semibold">{invitation.planReason}</span>
        </div>
        <p className="text-sm">
          {invitation.invitedByName ?? "Alguien"} te invitó a su grupo. Ya son{" "}
          {invitation.acceptedCount}.
          {invitation.tierIfJoins &&
            ` Si te sumás, cada uno paga ${money(invitation.tierIfJoins.pricePerMember)} por mes (${invitation.tierIfJoins.discountPercent} % de descuento).`}
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            radius="full"
            color="primary"
            isLoading={busy === "accept"}
            onPress={() => respond(true)}
          >
            Sumarme
          </Button>
          <Button
            size="sm"
            radius="full"
            variant="light"
            isLoading={busy === "reject"}
            onPress={() => respond(false)}
          >
            No, gracias
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

function GroupView({
  group,
  onChange,
}: {
  group: FriendGroup;
  onChange: () => Promise<void>;
}) {
  const forming = group.status === "forming";
  const paid = ["paying", "active", "paymentFailed"].includes(group.status);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-wrap items-center gap-3">
        <FaUserGroup className="text-primary size-7" />
        <h2 className="text-2xl font-semibold">{group.planReason}</h2>
        <Chip color={FRIEND_GROUP_STATUS_COLOR[group.status]} variant="flat">
          {FRIEND_GROUP_STATUS_LABEL[group.status]}
        </Chip>
      </div>

      {paid && <PaidSummary group={group} />}
      {paid && (
        <FriendGroupMockActions groupId={group._id} status={group.status} onDone={onChange} />
      )}
      {forming && <PriceSummary group={group} />}

      <MembersList group={group} onChange={onChange} />

      {forming && <InviteSection group={group} onChange={onChange} />}
      {forming && <PaySection group={group} onChange={onChange} />}

      <LeaveButton group={group} onChange={onChange} />
    </div>
  );
}

function PriceSummary({ group }: { group: FriendGroup }) {
  const pricing = group.pricing;
  if (!pricing) return null;
  return (
    <Card shadow="sm" className="bg-default-50">
      <CardBody className="flex flex-col gap-1">
        <span className="text-sm font-medium">Resumen</span>
        <p className="text-sm">
          {pricing.memberCount} {pricing.memberCount === 1 ? "miembro" : "miembros"} ×{" "}
          {money(pricing.pricePerMember)}
          {pricing.discountPercent > 0 && ` (${pricing.discountPercent} % de descuento)`}
        </p>
        <p className="text-lg">
          Débito mensual del grupo: <strong>{money(pricing.totalAmount)}</strong>
        </p>
        <p className="text-xs text-light-text">
          Solo, el plan cuesta {money(pricing.planAmount)} por mes.
        </p>
        {group.nextTier && (
          <p className="text-sm text-primary">
            Si se suma uno más, cada uno paga {money(group.nextTier.pricePerMember)} (
            {group.nextTier.discountPercent} % de descuento).
          </p>
        )}
      </CardBody>
    </Card>
  );
}

function PaidSummary({ group }: { group: FriendGroup }) {
  const pricing = group.pricing;
  return (
    <Card shadow="sm" className="bg-default-50">
      <CardBody className="flex flex-col gap-2">
        {group.status === "paying" && (
          <p className="text-sm">
            MercadoPago está procesando el débito. Cuando se apruebe, el plan se
            activa para todos.
          </p>
        )}
        {group.status === "active" && group.activatedAt && (
          <p className="text-sm">Plan activo desde el {formatPaymentDate(group.activatedAt)}.</p>
        )}
        {group.status === "paymentFailed" && (
          <div className="flex flex-col gap-2 items-start">
            <p className="text-sm text-danger">
              MercadoPago no pudo cobrar el débito del grupo y va a reintentar.
              Mientras tanto, tienen los límites del plan gratuito. Si no se logra
              cobrar, se cancela el plan para todos.
            </p>
            {group.isPayer && group.mpPreapprovalId ? (
              <Button
                as={Link}
                href={`/cambiar-metodo-pago/${group.mpPreapprovalId}`}
                size="sm"
                radius="full"
                color="primary"
              >
                Cambiar la tarjeta
              </Button>
            ) : (
              <p className="text-sm">
                Avisale a {group.payerName ?? "quien paga"} que revise la tarjeta.
              </p>
            )}
          </div>
        )}
        {pricing && (
          <p className="text-sm">
            Paga {group.isPayer ? "vos" : (group.payerName ?? "un miembro")}:{" "}
            <strong>{money(pricing.totalAmount)}</strong> por mes ({pricing.memberCount} ×{" "}
            {money(pricing.pricePerMember)}, {pricing.discountPercent} % de descuento).
          </p>
        )}
        {group.isPayer && group.status === "active" && group.mpPreapprovalId && (
          <Link href={`/cambiar-metodo-pago/${group.mpPreapprovalId}`} size="sm">
            Cambiar la tarjeta del débito
          </Link>
        )}
      </CardBody>
    </Card>
  );
}

function MembersList({
  group,
  onChange,
}: {
  group: FriendGroup;
  onChange: () => Promise<void>;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const forming = group.status === "forming";

  const remove = async (userId: string) => {
    setBusyId(userId);
    const response = await removeFriendGroupMember(group._id, userId);
    setBusyId(null);
    if ("error" in response) {
      toastifyError(response.error);
      return;
    }
    await onChange();
  };

  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-semibold">Miembros</h3>
      {group.members.map((member) => (
        <div
          key={member.userId}
          className="flex flex-wrap items-center gap-3 border-b border-default-100 pb-2"
        >
          <Avatar size="sm" src={member.profilePhotoUrl ?? undefined} name={member.name ?? ""} />
          <div className="flex flex-col flex-1 min-w-[140px]">
            <span className="text-sm font-medium">{member.name ?? member.username}</span>
            {member.username && (
              <span className="text-tiny text-default-400">@{member.username}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {member.isCreator && <Chip size="sm" variant="flat">Armó el grupo</Chip>}
            {member.isPayer && <Chip size="sm" variant="flat" color="secondary">Paga</Chip>}
            {member.status === "invited" ? (
              <Chip size="sm" variant="flat" color="default">
                Invitado
              </Chip>
            ) : forming ? (
              member.isActivated ? (
                <Chip size="sm" variant="flat" color="success">
                  Ya publicó
                </Chip>
              ) : (
                <Chip size="sm" variant="flat" color="warning">
                  Falta publicar
                </Chip>
              )
            ) : null}
          </div>
          {forming && group.isCreator && !member.isCreator && (
            <Button
              size="sm"
              variant="light"
              color="danger"
              isLoading={busyId === member.userId}
              onPress={() => remove(member.userId)}
            >
              Sacar
            </Button>
          )}
        </div>
      ))}
      {forming && (
        <p className="text-xs text-light-text">
          Para pagar, cada miembro tiene que haber publicado al menos un anuncio o
          una producción.
        </p>
      )}
    </section>
  );
}

function InviteSection({
  group,
  onChange,
}: {
  group: FriendGroup;
  onChange: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [pickerKey, setPickerKey] = useState(0);
  const absoluteLink =
    group.inviteCode && typeof window !== "undefined"
      ? `${window.location.origin}${FRIEND_PLAN_JOIN}/${group.inviteCode}`
      : null;

  const invite = async (user: User | null) => {
    if (!user) return;
    setBusy(true);
    const response = await inviteToFriendGroup(group._id, user._id);
    setBusy(false);
    setPickerKey((key) => key + 1);
    if ("error" in response) {
      toastifyError(response.error);
      return;
    }
    toastifySuccess(`Invitaste a @${user.username}. Le llega una notificación.`);
    await onChange();
  };

  const copy = async () => {
    if (!absoluteLink) return;
    try {
      await navigator.clipboard.writeText(absoluteLink);
      toastifySuccess("Link copiado");
    } catch {
      toastifyError("No se pudo copiar. Copialo a mano.");
    }
  };

  const share = async () => {
    if (!absoluteLink) return;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: "Hacete Amigo en Soon",
          text: "Sumate a mi grupo de Hacete Amigo y paguemos menos.",
          url: absoluteLink,
        });
        return;
      } catch {
        // El usuario cerró el menú de compartir.
        return;
      }
    }
    await copy();
  };

  const regenerate = async () => {
    setBusy(true);
    const response = await regenerateFriendGroupInviteCode(group._id);
    setBusy(false);
    if ("error" in response) {
      toastifyError(response.error);
      return;
    }
    toastifySuccess("Listo: el link anterior ya no sirve.");
    await onChange();
  };

  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-semibold">Invitar</h3>
      <UserPicker
        key={pickerKey}
        label="Buscar en Soon"
        excludeIds={group.members.map((member) => member.userId)}
        onSelect={invite}
        isDisabled={busy}
        description="Le llega una invitación por notificación."
      />
      {absoluteLink && (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">O mandales el link (sirve aunque no tengan cuenta)</span>
          <div className="flex flex-wrap gap-2 items-center">
            <code className="text-xs bg-default-100 rounded-lg px-3 py-2 break-all">
              {absoluteLink}
            </code>
            <Button size="sm" radius="full" onPress={copy}>
              Copiar
            </Button>
            <Button size="sm" radius="full" variant="bordered" onPress={share}>
              Compartir
            </Button>
            {group.isCreator && (
              <Button size="sm" radius="full" variant="light" isDisabled={busy} onPress={regenerate}>
                Cambiar el link
              </Button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function PaySection({
  group,
  onChange,
}: {
  group: FriendGroup;
  onChange: () => Promise<void>;
}) {
  const [checkout, setCheckout] = useState<FriendGroupPricing | null>(null);
  const [busy, setBusy] = useState(false);

  const start = async () => {
    setBusy(true);
    const response = await getFriendGroupCheckout(group._id);
    setBusy(false);
    if ("error" in response) {
      toastifyError(response.error);
      await onChange();
      return;
    }
    setCheckout(response);
  };

  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-semibold">Pagar</h3>
      {!group.canPay ? (
        <p className="text-sm">{group.payBlockedReason ?? "Todavía no se puede pagar el grupo."}</p>
      ) : checkout ? (
        <>
          <p className="text-sm">
            Vas a pagar vos por todos: <strong>{money(checkout.totalAmount)}</strong> por mes
            ({checkout.memberCount} × {money(checkout.pricePerMember)}) con débito
            automático. Una vez pagado el grupo queda fijo.
          </p>
          <FriendGroupPayLoader
            groupId={group._id}
            totalAmount={checkout.totalAmount}
            onPaid={() => {
              setCheckout(null);
              onChange();
            }}
          />
        </>
      ) : (
        <div className="flex flex-col gap-2 items-start">
          <p className="text-sm">
            Ya pueden pagar. Uno del grupo paga por todos con débito automático.
          </p>
          <Button color="primary" radius="full" isLoading={busy} onPress={start}>
            Pagar yo por el grupo
          </Button>
        </div>
      )}
    </section>
  );
}

function LeaveButton({
  group,
  onChange,
}: {
  group: FriendGroup;
  onChange: () => Promise<void>;
}) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [busy, setBusy] = useState(false);
  const paid = group.status !== "forming";

  const leave = async () => {
    setBusy(true);
    const response = await leaveFriendGroup(group._id);
    setBusy(false);
    if ("error" in response) {
      toastifyError(response.error);
      return;
    }
    onClose();
    toastifySuccess(paid ? "Te bajaste: el plan del grupo se canceló." : "Saliste del grupo.");
    await onChange();
  };

  return (
    <>
      <Button
        variant="light"
        color="danger"
        className="self-start"
        onPress={onOpen}
      >
        Salir del grupo
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>Salir del grupo</ModalHeader>
          <ModalBody>
            {paid ? (
              <p className="text-sm">
                <strong>Se cancela el plan para todos.</strong> El grupo ya está
                pagado: si te bajás, se da de baja el débito y nadie del grupo
                sigue con el plan.
              </p>
            ) : group.isCreator ? (
              <p className="text-sm">
                Salís del grupo. Si queda alguien, el grupo pasa a quien se sumó
                primero; si no, se cierra.
              </p>
            ) : (
              <p className="text-sm">Salís del grupo. Te pueden volver a invitar.</p>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancelar
            </Button>
            <Button color="danger" isLoading={busy} onPress={leave}>
              {paid ? "Bajarme y cancelar para todos" : "Salir"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
