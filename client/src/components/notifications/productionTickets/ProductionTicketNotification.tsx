import { Link } from "@nextui-org/react";
import { FaTicketAlt } from "react-icons/fa";
import {
  ProductionTicketNotification as ProductionTicketNotificationType,
  ProductionTicketNotificationAudience,
  ProductionTicketNotificationEvent,
} from "@/types/productionTypes";
import { PRODUCTIONS } from "@/utils/data/urls";
import { useNotificationsIsOpen } from "@/components/Header/Notifications/notificationsOptionsProvider";
import {
  NotificationBody,
  NotificationCard,
  NotificationImage,
} from "../NotificationCard";

const ADMIN_PANEL = "/admin";

type TicketData =
  ProductionTicketNotificationType["frontData"]["productionTicket"];

const money = (currency?: string | null, value?: number | null) =>
  `${currency ?? "ARS"} ${(value ?? 0).toLocaleString("es-AR", {
    maximumFractionDigits: 2,
  })}`;

/**
 * Texto por evento y destinatario. Un evento sin texto para esa audiencia no
 * se muestra (el server tampoco lo manda).
 */
const messages: Record<
  ProductionTicketNotificationEvent,
  Partial<
    Record<ProductionTicketNotificationAudience, (data: TicketData) => string>
  >
> = {
  notification_production_ticket_purchased: {
    buyer: (d) =>
      `Recibimos tu compra por ${money(d.currency, d.amount)}. El acceso se habilita cuando el blog verifique tu transferencia.`,
    staff: (d) =>
      `Vendiste un ticket por ${money(d.currency, d.amount)}. Verificá que te llegó la transferencia de ${money(d.currency, d.creatorPayoutAmount)} y habilitá el acceso.`,
    admin: (d) =>
      `Nueva compra de ticket por ${money(d.currency, d.amount)}: hay una comisión de ${money(d.currency, d.commissionAmount)} para verificar.`,
  },
  notification_production_ticket_activated: {
    buyer: () => "Tu acceso ya está habilitado.",
    staff: (d) =>
      `Se verificó la transferencia de ${money(d.currency, d.creatorPayoutAmount)} y el acceso del comprador quedó habilitado.`,
  },
  notification_production_ticket_rejected: {
    buyer: (d) => `Tu compra fue rechazada${d.reason ? `: ${d.reason}` : "."}`,
    staff: (d) =>
      `Se rechazó una compra de ${money(d.currency, d.amount)}${d.reason ? `: ${d.reason}` : "."}`,
  },
  notification_production_ticket_suspended: {
    buyer: (d) =>
      `Tu acceso está suspendido: falta la comisión de ${money(d.currency, d.commissionAmount)} para Soonpublicité. Se restablece cuando la pagues.`,
    staff: () =>
      "Soonpublicité suspendió el acceso de un comprador porque no pagó la comisión.",
  },
  notification_production_ticket_restored: {
    buyer: () =>
      "Registramos el pago de la comisión: tu acceso volvió a estar habilitado.",
    staff: () =>
      "El comprador pagó la comisión de Soonpublicité y ya no está suspendido.",
  },
  notification_production_ticket_factura_attached: {
    buyer: (d) =>
      `Ya está disponible la factura de la comisión de ${money(d.currency, d.commissionAmount)} que pagaste por tu ticket.`,
  },
};

const ProductionTicketNotification = ({
  notification,
}: {
  notification: ProductionTicketNotificationType;
}) => {
  const { setIsOpen } = useNotificationsIsOpen();
  const data = notification.frontData?.productionTicket;
  if (!data) return null;

  const message =
    messages[notification.event as ProductionTicketNotificationEvent]?.[
      data.audience
    ];
  if (!message) return null;

  const isAdmin = data.audience === "admin";
  const content = data.targetName
    ? `${data.targetName} · ${data.productionTitle}`
    : data.productionTitle;

  return (
    <NotificationCard isNew={!notification.viewed} id={notification._id}>
      <NotificationImage>
        <FaTicketAlt className="text-success size-10" />
      </NotificationImage>
      <NotificationBody>
        <p className="text-sm">
          <span className="font-semibold">{content}</span>
          {": "}
          {message(data)}{" "}
          <Link
            size="sm"
            onClick={() => setIsOpen(false)}
            href={isAdmin ? ADMIN_PANEL : `${PRODUCTIONS}/${data.productionId}`}
          >
            {isAdmin
              ? "Ir al panel de admin"
              : data.audience === "staff"
                ? "Ver ventas en el blog"
                : "Ir al blog"}
          </Link>
        </p>
      </NotificationBody>
    </NotificationCard>
  );
};

export default ProductionTicketNotification;
