import {
  PaymentStatusNotificationType,
  SubscriptionEvent,
} from "@/types/subscriptions";

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
  free_trial: {
    message: "Se ha activado la prueba gratuita de la suscripción a",
  },
  subscription_cancelled: {
    message: "Se ha cancelado la suscripción a",
  },
};

export const subscriptionNotificationMessages: Record<
  SubscriptionEvent,
  {
    message: string;
  }
> = {
  notification_downgrade_plan_contact: {
    message:
      "El plan de suscripción a ha cambiado, por lo que se han reducido las relaciones activas. Por favor, seleccione las relaciones que desea mantener en",
  },
  notification_downgrade_plan_post: {
    message:
      "El plan de suscripción a ha cambiado, por lo que se han reducido los anuncios activos. Por favor, seleccione los anuncios que desea mantener en",
  },
};
