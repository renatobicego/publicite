import { Link } from "@nextui-org/react";
import { FaGift, FaUserGroup } from "react-icons/fa6";

import { useNotificationsIsOpen } from "@/components/Header/Notifications/notificationsOptionsProvider";
import { monthsLabel } from "@/types/planGiftTypes";
import { FRIEND_PLAN, MY_PLAN_GIFTS } from "@/utils/data/urls";
import {
  NotificationBody,
  NotificationCard,
  NotificationImage,
} from "../NotificationCard";

/** Eventos de planes compartidos: regalos y Hacete Amigo (tipo `plan_notifications` del server). */
export type PlanNotificationEvent =
  | "notification_plan_gift_received"
  | "notification_plan_gift_activated"
  | "notification_plan_friend_invited"
  | "notification_plan_friend_accepted"
  | "notification_plan_friend_rejected"
  | "notification_plan_friend_ready_to_pay"
  | "notification_plan_friend_active"
  | "notification_plan_friend_charge_failed"
  | "notification_plan_friend_charge_recovered"
  | "notification_plan_friend_cancelled";

export interface PlanNotificationData {
  kind: "gift" | "friendGroup";
  entityId: string;
  actorName: string | null;
  planReason: string | null;
  months: number | null;
  reason: string | null;
  isPayer: boolean | null;
}

export interface PlanNotificationType extends BaseNotification {
  frontData: { plan: PlanNotificationData };
}

const plan = (d: PlanNotificationData) => d.planReason ?? "el plan";

const messages: Record<PlanNotificationEvent, (d: PlanNotificationData) => string> = {
  notification_plan_gift_received: (d) =>
    `${d.actorName ?? "Alguien"} te regaló ${d.months ? monthsLabel(d.months) : "meses"} de ${plan(d)}. Los meses empiezan a contar cuando lo activás.`,
  notification_plan_gift_activated: (d) =>
    `${d.actorName ?? "La persona"} activó ${plan(d)}, el plan que le regalaste.`,
  notification_plan_friend_invited: (d) =>
    `${d.actorName ?? "Alguien"} te invitó a su grupo de Hacete Amigo (${plan(d)}). Entre todos pagan menos.`,
  notification_plan_friend_accepted: (d) =>
    `${d.actorName ?? "Alguien"} se sumó a tu grupo de Hacete Amigo.`,
  notification_plan_friend_rejected: (d) =>
    `${d.actorName ?? "Alguien"} no aceptó la invitación a tu grupo de Hacete Amigo.`,
  notification_plan_friend_ready_to_pay: (d) =>
    d.isPayer
      ? "Tu grupo de Hacete Amigo está listo: ya podés pagar el plan compartido."
      : "Tu grupo de Hacete Amigo está listo para pagar.",
  notification_plan_friend_active: (d) =>
    `¡Listo! ${plan(d)} de tu grupo de Hacete Amigo quedó activo.`,
  notification_plan_friend_charge_failed: (d) =>
    d.isPayer
      ? "MercadoPago no pudo cobrar el plan de tu grupo de Hacete Amigo. Revisá o cambiá la tarjeta para que el grupo no pierda el plan."
      : "No se pudo cobrar el plan de tu grupo de Hacete Amigo. Mientras tanto, tenés los límites del plan gratuito.",
  notification_plan_friend_charge_recovered: (d) =>
    `Se cobró el plan de tu grupo de Hacete Amigo: ${plan(d)} volvió a estar activo.`,
  notification_plan_friend_cancelled: (d) =>
    `Se terminó tu grupo de Hacete Amigo${d.reason ? `: ${d.reason}` : "."}`,
};

const PlanNotification = ({ notification }: { notification: PlanNotificationType }) => {
  const { setIsOpen } = useNotificationsIsOpen();
  const data = notification.frontData?.plan;
  const message = messages[notification.event as PlanNotificationEvent];
  if (!data || !message) return null;

  const isGift = data.kind === "gift";
  const Icon = isGift ? FaGift : FaUserGroup;
  return (
    <NotificationCard isNew={!notification.viewed} id={notification._id}>
      <NotificationImage>
        <Icon className="text-primary size-10" />
      </NotificationImage>
      <NotificationBody>
        <p className="text-sm">
          {message(data)}{" "}
          <Link
            size="sm"
            onClick={() => setIsOpen(false)}
            href={isGift ? MY_PLAN_GIFTS : FRIEND_PLAN}
          >
            {isGift ? "Ver mis regalos" : "Ir a mi grupo"}
          </Link>
        </p>
      </NotificationBody>
    </NotificationCard>
  );
};

export default PlanNotification;
