"use server";
import {
  getPaymentsQuery,
  getPostNumbersOfUserQuery,
} from "@/graphql/suscriptionsQueries";
import { query } from "@/lib/client";
import { auth, currentUser } from "@clerk/nextjs/server";
import axios from "axios";
import { getApiContext } from "./apiContext";
import { Invoice, Subscription, SubscriptionPlan } from "@/types/subscriptions";

export const processPayment = async (
  formData: any,
  subscriptionPlan: any,
  userId: string
) => {
  try {
    const { data } = await axios.post(
      process.env.CLIENT_URL + "/api/subscriptions/process_payment",
      {
        formData,
        subscriptionPlan,
        userId,
      }
    );

    // if (status !== 200 && status !== 201) {
    //   return {
    //     error: "Error al procesar el pago. Por favor intenta de nuevo.",
    //   };
    // }

    return data;
  } catch (error) {
    console.error(error);
    return {
      error: "Error al procesar el pago. Por favor intenta de nuevo.",
    };
  }
};

export const editSubscription = async (
  subscriptionId: string,
  formData: {
    status?: "authorized" | "paused" | "cancelled" | "pending";
    card_token_id?: string;
  }
) => {
  try {
    await axios.put(process.env.CLIENT_URL + "/api/subscriptions/update", {
      formData,
      subscriptionId,
    });
    return {
      message: "Suscripción actualizada exitosamente.",
    };
  } catch (error) {
    console.error(error);
    return {
      error: "Error al actualizar la suscripción. Por favor intenta de nuevo.",
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
      Authorization: `Bearer ${await auth().getToken({ template: "testing" })}`,
    },
  });
  if (!res.ok) {
    throw new Error(
      "Error al traer los datos de los planes de suscripción. Por favor intenta de nuevo."
    );
  }
  const data = await res.json();
  return data;
};

export const getSubscriptionsOfUser = async (
  userId: string
): Promise<Subscription[] | { error: string }> => {
  try {
    const res = await fetch(process.env.API_URL + "/subscription/" + userId, {
      headers: {
        Authorization: `Bearer ${await auth().getToken({
          template: "testing",
        })}`,
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
    const { context } = await getApiContext();
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
  const user = await currentUser();
  try {
    const { data } = await axios.get(
      "https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&external_reference=" +
        user?.publicMetadata.mongoId,
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
    const { context } = await getApiContext();
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
