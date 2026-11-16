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
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight, FaUserGroup, FaWhatsapp } from "react-icons/fa6";

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
import CubeFriend from "@/components/friendPlan/CubeFriend";
import { useWizard, WizardSlide, WizardSteps } from "@/components/wizard/Wizard";

/*
Panel de Hacete Amigo: el grupo del usuario (miembros, invitar, link, resumen
del precio, pagar, salir) o, si no tiene grupo, sus invitaciones.
*/
export default function FriendGroupPanel({ initialStep = 1 }: { initialStep?: number }) {
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

  return <GroupView group={data.group} onChange={reloadWithLimits} initialStep={initialStep} />;
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
  initialStep = 1,
}: {
  group: FriendGroup;
  onChange: () => Promise<void>;
  /** Paso con el que abre el asistente (?paso=N, p. ej. desde una notificación). */
  initialStep?: number;
}) {
  if (group.status === "forming") {
    return <FormingWizard group={group} onChange={onChange} initialStep={initialStep} />;
  }

  // Pagado: el grupo queda fijo, no hay nada para invitar ni pagar.
  return (
    <div className="flex flex-col gap-4 w-full">
      <GroupHeader group={group} />
      <PaidSummary group={group} />
      <FriendGroupMockActions groupId={group._id} status={group.status} onDone={onChange} />
      <Card shadow="sm">
        <CardBody className="flex flex-col gap-3 p-4 sm:p-5">
          <MembersList group={group} onChange={onChange} />
          <LeaveButton group={group} onChange={onChange} />
        </CardBody>
      </Card>
    </div>
  );
}

const FORMING_STEPS = [
  { step: 1, label: "Resumen" },
  { step: 2, label: "Miembros e invitar" },
  { step: 3, label: "Link" },
  { step: 4, label: "Pago" },
];

/*
Mientras el grupo se arma, el panel es un asistente de 4 pasos (sin scroll):
resumen, miembros e invitar, link de invitación y pago.
*/
function FormingWizard({
  group,
  onChange,
  initialStep,
}: {
  group: FriendGroup;
  onChange: () => Promise<void>;
  initialStep: number;
}) {
  const { step, direction, go } = useWizard(
    Math.min(Math.max(1, Math.trunc(initialStep) || 1), FORMING_STEPS.length)
  );
  const last = FORMING_STEPS.length;

  return (
    <div className="flex flex-col gap-3 w-full">
      <GroupHeader group={group} />
      <WizardSteps steps={FORMING_STEPS} current={step} onSelect={go} />
      <WizardSlide step={step} direction={direction}>
        <Card shadow="sm">
          <CardBody className="flex flex-col gap-4 p-4 sm:p-5">
            {step === 1 && <SummaryStep group={group} go={go} />}
            {step === 2 && (
              <>
                <MembersList group={group} onChange={onChange} />
                <InviteSearch group={group} onChange={onChange} />
              </>
            )}
            {step === 3 && <InviteLink group={group} onChange={onChange} />}
            {step === 4 && <PaySection group={group} onChange={onChange} go={go} />}

            {/* En celular el botón principal va arriba y a todo el ancho: así no lo
                tapan los botones flotantes de Cubito y Crear. */}
            <div className="flex flex-col-reverse items-start gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
              {step === 1 ? (
                <LeaveButton group={group} onChange={onChange} />
              ) : (
                <Button
                  variant="light"
                  radius="full"
                  startContent={<FaArrowLeft />}
                  onPress={() => go(step - 1)}
                >
                  Atrás
                </Button>
              )}
              {step < last && (
                <Button
                  color="primary"
                  radius="full"
                  className="w-full sm:w-auto"
                  endContent={<FaArrowRight />}
                  onPress={() => go(step + 1)}
                >
                  Siguiente
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      </WizardSlide>
    </div>
  );
}

function GroupHeader({ group }: { group: FriendGroup }) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <FaUserGroup className="text-primary size-6" />
      <h2 className="text-xl sm:text-2xl font-semibold">{group.planReason}</h2>
      <Chip color={FRIEND_GROUP_STATUS_COLOR[group.status]} variant="flat" size="sm">
        {FRIEND_GROUP_STATUS_LABEL[group.status]}
      </Chip>
    </div>
  );
}

/** Nombre de pila para mostrar debajo de cada cubito. */
const firstName = (member: FriendGroup["members"][number]) =>
  member.name?.split(" ")[0] || member.username || "Amigo";

/*
Paso 1: los miembros como Cubitos (los invitados, transparentes, y un lugar
libre para el próximo), el precio de hoy y qué falta para poder pagar.
*/
function SummaryStep({ group, go }: { group: FriendGroup; go: (step: number) => void }) {
  const pricing = group.pricing;
  const accepted = group.members.filter((member) => member.status === "accepted");
  const invited = group.members.filter((member) => member.status === "invited");
  const missingMembers = accepted.length < 2;
  // Cubito es el protagonista: cuantos menos son, más grandes se ven.
  const shown = accepted.length + invited.length + (group.nextTier ? 1 : 0);
  const size =
    shown <= 3
      ? { column: "w-24 sm:w-32", cube: "w-20 h-20 sm:w-28 sm:h-28", slot: "w-16 h-16 sm:w-20 sm:h-20" }
      : shown <= 5
        ? { column: "w-16 sm:w-24", cube: "w-14 h-14 sm:w-20 sm:h-20", slot: "w-12 h-12 sm:w-16 sm:h-16" }
        : { column: "w-14 sm:w-20", cube: "w-12 h-12 sm:w-16 sm:h-16", slot: "w-10 h-10 sm:w-12 sm:h-12" };
  const bubble = group.canPay
    ? "¡Listo! Ya podemos pagar."
    : missingMembers
      ? "¡Sumá amigos y pagamos menos!"
      : "¡Ya casi! Falta que todos publiquen algo.";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-center gap-2 sm:gap-4 rounded-2xl bg-gradient-to-b from-primary/10 via-primary/5 to-transparent px-3 pt-5 pb-2">
        {/* Cubito (el primero) habla: qué le falta al grupo. Sólo si hay lugar al lado. */}
        {shown <= 3 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={bubble}
              initial={{ opacity: 0, x: 8, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -8 }}
              className="hidden sm:block self-start mt-3 max-w-[11rem] rounded-2xl rounded-br-sm bg-white shadow-md px-3 py-2 text-sm font-medium text-text-color"
            >
              {bubble}
            </motion.div>
          </AnimatePresence>
        )}
        {accepted.map((member, index) => (
          <div key={member.userId} className={`flex flex-col items-center ${size.column}`}>
            <div className={size.cube}>
              <CubeFriend
                palette={index}
                blinkDelay={index * 0.7}
                floatDelay={index * 0.45}
                happy={group.canPay}
              />
            </div>
            <span className="text-xs font-medium text-default-700 truncate max-w-full">
              {firstName(member)}
            </span>
            <span className="text-[10px] text-default-400 leading-tight">
              {member.isCreator ? "armó el grupo" : "aceptó"}
            </span>
          </div>
        ))}
        {invited.map((member, index) => (
          <div key={member.userId} className={`flex flex-col items-center ${size.column}`}>
            {/* Sólo el cubito transparente: el nombre se lee */}
            <div className={`${size.cube} opacity-40`}>
              <CubeFriend
                palette={accepted.length + index}
                floatDelay={(accepted.length + index) * 0.45}
              />
            </div>
            <span className="text-xs font-medium text-default-600 truncate max-w-full">
              {firstName(member)}
            </span>
            <span className="text-[10px] text-default-400 leading-tight">invitado</span>
          </div>
        ))}
        {group.nextTier && (
          <button
            type="button"
            onClick={() => go(2)}
            className={`flex flex-col items-center ${size.column}`}
            aria-label="Invitar a alguien más"
          >
            <span
              className={`${size.slot} mb-1 rounded-2xl border-2 border-dashed border-primary/40 text-primary flex items-center justify-center text-2xl transition-colors hover:bg-primary/5`}
            >
              +
            </span>
            <span className="text-xs text-primary font-medium">sumar</span>
            <span className="text-[10px] text-primary/70 leading-tight">
              {group.nextTier && group.nextTier.discountPercent > 0
                ? `-${group.nextTier.discountPercent} % c/u`
                : <>&nbsp;</>}
            </span>
          </button>
        )}
      </div>

      {pricing && (
        <div className="flex flex-col gap-1">
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
        </div>
      )}

      {group.canPay ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-success-50 px-3 py-2">
          <span className="text-sm text-success-700 font-medium">¡Ya pueden pagar!</span>
          <Button size="sm" radius="full" color="success" variant="flat" onPress={() => go(4)}>
            Ir a pagar
          </Button>
        </div>
      ) : (
        group.payBlockedReason && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-warning-50 px-3 py-2">
            <span className="text-sm text-warning-700">{group.payBlockedReason}</span>
            {missingMembers && (
              <Button size="sm" radius="full" color="warning" variant="flat" onPress={() => go(2)}>
                Invitar amigos
              </Button>
            )}
          </div>
        )
      )}
    </div>
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
      <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
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
      </div>
      {forming && (
        <p className="hidden sm:block text-xs text-light-text">
          Para pagar, cada miembro tiene que haber publicado al menos un anuncio o
          una producción.
        </p>
      )}
    </section>
  );
}

function inviteLinkOf(group: FriendGroup): string | null {
  if (!group.inviteCode || typeof window === "undefined") return null;
  return `${window.location.origin}${FRIEND_PLAN_JOIN}/${group.inviteCode}`;
}

/* Paso 2 (abajo de los miembros): invitar con el buscador de usuarios. */
function InviteSearch({
  group,
  onChange,
}: {
  group: FriendGroup;
  onChange: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [pickerKey, setPickerKey] = useState(0);

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

  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-semibold">Invitar</h3>
      <UserPicker
        key={pickerKey}
        label="Buscar en Soon"
        excludeIds={group.members.map((member) => member.userId)}
        onSelect={invite}
        isDisabled={busy}
        description="Le llega una invitación por notificación. ¿Sin cuenta? Usá el link (paso 3)."
      />
    </section>
  );
}

/* Paso 3: el link de invitación, para mandarlo por donde quieran. */
function InviteLink({
  group,
  onChange,
}: {
  group: FriendGroup;
  onChange: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const link = inviteLinkOf(group);
  const message = "Sumate a mi grupo de Hacete Amigo en Soon y paguemos menos.";

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      toastifySuccess("Link copiado");
    } catch {
      toastifyError("No se pudo copiar. Copialo a mano.");
    }
  };

  const share = async () => {
    if (!link) return;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: "Hacete Amigo en Soon", text: message, url: link });
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

  if (!link) return <p className="text-sm">El link de invitación no está disponible.</p>;

  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-semibold">Link de invitación</h3>
      <p className="text-sm">
        Mandalo por WhatsApp o por donde quieras. Sirve aunque no tengan cuenta: se
        registran y entran directo al grupo.
      </p>
      <code className="text-xs sm:text-sm bg-default-100 rounded-lg px-3 py-2 break-all">{link}</code>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" radius="full" color="primary" onPress={copy}>
          Copiar link
        </Button>
        <Button
          size="sm"
          radius="full"
          variant="bordered"
          as={Link}
          isExternal
          href={`https://wa.me/?text=${encodeURIComponent(`${message} ${link}`)}`}
          startContent={<FaWhatsapp />}
        >
          WhatsApp
        </Button>
        <Button size="sm" radius="full" variant="bordered" onPress={share}>
          Compartir
        </Button>
      </div>
      {group.isCreator && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-light-text">
          <span>¿Se compartió de más? Cambialo y el anterior deja de servir.</span>
          <Button size="sm" variant="light" isDisabled={busy} onPress={regenerate}>
            Cambiar el link
          </Button>
        </div>
      )}
    </section>
  );
}

function PaySection({
  group,
  onChange,
  go,
}: {
  group: FriendGroup;
  onChange: () => Promise<void>;
  go: (step: number) => void;
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
      <h3 className="font-semibold">Pago</h3>
      {!group.canPay ? (
        <div className="flex flex-col gap-2 items-start">
          <p className="text-sm">{group.payBlockedReason ?? "Todavía no se puede pagar el grupo."}</p>
          <Button size="sm" radius="full" variant="flat" onPress={() => go(2)}>
            Ver miembros
          </Button>
        </div>
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
