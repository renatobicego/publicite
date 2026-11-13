"use server";
import {
  cancelMySubscriptionMutation,
  getPaymentsQuery,
  getPostNumbersOfUserQuery,
  startSubscriptionCheckoutMutation,
  updateMySubscriptionCardMutation,
} from "@/graphql/suscriptionsQueries";
import { getClient, query } from "@/lib/client";
import { auth } from "@clerk/nextjs/server";
import axios from "axios";
import { getApiContext } from "./apiContext";
import {
  Invoice,
  Subscription,
  SubscriptionCheckoutResult,
  SubscriptionPlan,
} from "@/types/subscriptions";
import { getAuthToken } from "./auth-token";
import { getProductionErrorMessage } from "@/utils/functions/productionErrorHandler";

/*
Altas, bajas y cambio de tarjeta van al server (mutations con el token del
usuario). El server decide el usuario, el plan y el monto: el cliente sólo manda
el plan elegido y el token de la tarjeta que devuelve el Brick de MercadoPago.
*/

export const startSubscriptionCheckout = async (input: {
  mpPreapprovalPlanId: string;
  cardTokenId: string;
  payerEmail: string;
  replacesSubscriptionId?: string;
}): Promise<SubscriptionCheckoutResult | { error: string }> => {
  try {
    const { context } = await getApiContext(false, await getAuthToken());
    const { data } = await getClient().mutate({
      mutation: startSubscriptionCheckoutMutation,
      variables: { input },
      context,
    });
    return data.startSubscriptionCheckout as SubscriptionCheckoutResult;
  } catch (error) {
    console.error(error);
    return {
      error:
        getProductionErrorMessage(error) ??
        "No pudimos procesar el pago. Por favor intentá de nuevo.",
    };
  }
};

export const cancelMySubscription = async (
  mpPreapprovalId: string
): Promise<{ ok: true } | { error: string }> => {
  try {
    const { context } = await getApiContext(false, await getAuthToken());
    await getClient().mutate({
      mutation: cancelMySubscriptionMutation,
      variables: { mpPreapprovalId },
      context,
    });
    return { ok: true };
  } catch (error) {
    console.error(error);
    return {
      error:
        getProductionErrorMessage(error) ??
        "No pudimos cancelar la suscripción. Por favor intentá de nuevo.",
    };
  }
};

export const updateMySubscriptionCard = async (
  mpPreapprovalId: string,
  cardTokenId: string
): Promise<{ ok: true } | { error: string }> => {
  try {
    const { context } = await getApiContext(false, await getAuthToken());
    await getClient().mutate({
      mutation: updateMySubscriptionCardMutation,
      variables: { mpPreapprovalId, cardTokenId },
      context,
    });
    return { ok: true };
  } catch (error) {
    console.error(error);
    return {
      error:
        getProductionErrorMessage(error) ??
        "No pudimos cambiar la tarjeta. Por favor intentá de nuevo o contactá a soporte.",
    };
  }
};

export const getSubscriptionsPlansMP = async () => {
  try {
    const { data } = await axios.get(
      "https://api.mercadopago.com/preapproval_plan/search?status=active",
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      }
    );

    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getSubscriptionsPlans = async (): Promise<SubscriptionPlan[]> => {
  const res = await fetch(process.env.API_URL + "/subscriptionplans", {
    next: { revalidate: 180 },
    headers: {
      Authorization: `Bearer ${await getAuthToken()}`,
    },
  });
  if (!res.ok) {
    throw new Error(
      "Error al traer los datos de los planes de suscripción. Por favor intenta de nuevo."
    );
  }
  const data = await res.json();
  return data.filter((plan: SubscriptionPlan) => plan.isActive);
};

export const getSubscriptionsOfUser = async (
  userId: string
): Promise<Subscription[] | { error: string }> => {
  try {
    const res = await fetch(process.env.API_URL + "/subscription/" + userId, {
      headers: {
        Authorization: `Bearer ${await getAuthToken()}`,
      },
    });
    if (!res.ok) {
      return {
        error:
          "Error al traer los datos de suscripciones. Por favor intenta de nuevo.",
      };
    }
    const data = await res.json();
    return data;
  } catch (error) {
    return {
      error:
        "Error al traer los datos de suscripciones. Por favor intenta de nuevo.",
    };
  }
};

export const getUserActivePostandActiveRelationsNumber = async (): Promise<
  | {
      agendaAvailable: number;
      agendaPostCount: number;
      libreAvailable: number;
      librePostCount: number;
      totalAgendaPostLimit: number;
      totalLibrePostLimit: number;
      contactAvailable: number;
      contactCount: number;
      contactLimit: number;
    }
  | { error: string }
> => {
  try {
    const tokenCache = await getAuthToken();
    const { context } = await getApiContext(false, tokenCache);
    const { data } = await query({
      query: getPostNumbersOfUserQuery,
      context,
    });

    return data.getPostAndContactLimit;
  } catch (error) {
    return {
      error: "Error al traer los anuncios. Por favor intenta de nuevo.",
    };
  }
};

export const getSubscriptionPlanById = async (id: string) => {
  try {
    const { data, status } = await axios.get(
      "https://api.mercadopago.com/preapproval_plan/" + id,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      }
    );
    if (status !== 200 && status !== 201) {
      return {
        error:
          "Error al traer los datos del plan de suscripción. Por favor intenta de nuevo.",
      };
    }
    // Un plan cancelado en MercadoPago vuelve sin monto y no se puede cobrar.
    if (data.status !== "active" || !data.auto_recurring?.transaction_amount) {
      return {
        error:
          "Este plan de suscripción ya no está disponible. Por favor elegí otro plan.",
      };
    }
    return data;
  } catch (error) {
    return {
      error:
        "Error al traer los datos del plan de suscripción. Por favor intenta de nuevo.",
    };
  }
};

export const getSubscriptionById = async (id: string) => {
  try {
    const { data } = await axios.get(
      "https://api.mercadopago.com/preapproval/" + id,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getSubscriptionByEmail = async (email: string) => {
  try {
    const { data } = await axios.get(
      "https://api.mercadopago.com/preapproval/search?status=authorized&status=paused&payer_email=" +
        email,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getAuthorizedPayments = async (subscriptionId: string) => {
  // 30e07c11113748ad82e79f90ab91484f
  try {
    const { data } = await axios.get(
      "https://api.mercadopago.com/authorized_payments/search?preapproval_id=" +
        subscriptionId,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.log(error);
  }
};
export const getPaymentMethod = async () => {
  const user = await auth();
  try {
    const { data } = await axios.get(
      "https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&external_reference=" +
        user?.sessionClaims?.metadata.mongoId,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      }
    );
    const { results } = data;
    if (!results || results.length === 0) return;
    const resultsOrderedByDate = results.sort((a: any, b: any) => {
      return (
        new Date(b.date_approved).getTime() -
        new Date(a.date_approved).getTime()
      );
    });
    const {
      payment_method: { id },
      card: { last_four_digits },
      payment_type_id,
    } = resultsOrderedByDate.find(
      (payment: { status: string }) => payment.status === "approved"
    );
    return {
      lastDigits: last_four_digits,
      cardId: id,
      payment_type_id,
    };
  } catch (error) {
    return {
      error: "Error al traer el método de pago. Por favor intenta de nuevo.",
    };
  }
};

export const getPayments = async (
  page: number
): Promise<
  | {
      hasMore: boolean;
      invoices: Invoice[];
    }
  | { error: string }
> => {
  try {
    const tokenCache = await getAuthToken();
    const { context } = await getApiContext(false, tokenCache);
    const { data } = await query({
      query: getPaymentsQuery,
      variables: {
        page,
        limit: 20,
      },
      context,
    });
    return {
      hasMore: data.getAllInvoicesByExternalReferenceId.hasMore,
      invoices: data.getAllInvoicesByExternalReferenceId.invoices,
    };
  } catch (error) {
    return {
      error: "Error al traer los pagos. Por favor intenta de nuevo.",
    };
  }
};
