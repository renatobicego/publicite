import { PaymentStatusNotificationType } from "@/types/subscriptions";

export const paymentNotificationMessages: Record<
  PaymentStatusNotificationType,
  {
    message: string;
    endMessage?: string;
    attemptMessage?: string;
  }
> = {
  payment_approved: {
    message: "¡Gracias! Hemos recibido tu pago por la suscripción a",
  },
  payment_pending: {
    message: "El pago está en proceso por la suscripción a",
  },
  payment_rejected: {
    message: "Se ha rechazado el pago por la suscripción a",
    attemptMessage: " en el intento N°",
    endMessage:
      " Por favor, actualiza tu método de pago en Configuración - Suscripción",
  },
};
