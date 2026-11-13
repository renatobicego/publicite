"use server";

import { auth } from "@clerk/nextjs/server";

import {
  mpTestCreatePaymentMutation,
  mpTestCreatePreapprovalMutation,
  mpTestEventsQuery,
  mpTestGetPreapprovalQuery,
  mpTestSetPreapprovalStatusMutation,
} from "@/graphql/mpTestQueries";
import { getClient } from "@/lib/client";
import { getProductionErrorMessage } from "@/utils/functions/productionErrorHandler";
import { getApiContext } from "./apiContext";
import { getAuthToken } from "./auth-token";

/*
Pruebas de MercadoPago de la Fase 0 (panel admin). Devuelven el JSON crudo que
contesta MP. Se borra al terminar las pruebas.
*/

export interface MpTestEvent {
  _id: string;
  topic?: string;
  action?: string;
  dataId?: string;
  externalReference?: string;
  status?: string;
  amount?: number;
  receivedAt: string;
  payload?: string;
}

const NOT_ADMIN = { error: "No tenés permisos de administrador." };

const isAdmin = async (): Promise<boolean> =>
  (await auth()).sessionClaims?.metadata?.role === "admin";

const context = async () => (await getApiContext(false, await getAuthToken())).context;

const toError = (error: unknown) => ({
  error:
    getProductionErrorMessage(error) ??
    "No se pudo hacer la prueba. Mirá la consola del server.",
});

export const mpTestCreatePreapproval = async (
  amount: number,
  cardTokenId: string,
  payerEmail: string
): Promise<{ json: string } | { error: string }> => {
  if (!(await isAdmin())) return NOT_ADMIN;
  try {
    const { data } = await getClient().mutate({
      mutation: mpTestCreatePreapprovalMutation,
      variables: { amount, cardTokenId, payerEmail },
      context: await context(),
    });
    return { json: data.mpTestCreatePreapproval };
  } catch (error) {
    return toError(error);
  }
};

export const mpTestGetPreapproval = async (
  preapprovalId: string
): Promise<{ json: string } | { error: string }> => {
  if (!(await isAdmin())) return NOT_ADMIN;
  try {
    const { data } = await getClient().query({
      query: mpTestGetPreapprovalQuery,
      variables: { preapprovalId },
      context: await context(),
      fetchPolicy: "no-cache",
    });
    return { json: data.mpTestGetPreapproval };
  } catch (error) {
    return toError(error);
  }
};

export const mpTestSetPreapprovalStatus = async (
  preapprovalId: string,
  status: "paused" | "authorized" | "cancelled" | "canceled"
): Promise<{ json: string } | { error: string }> => {
  if (!(await isAdmin())) return NOT_ADMIN;
  try {
    const { data } = await getClient().mutate({
      mutation: mpTestSetPreapprovalStatusMutation,
      variables: { preapprovalId, status },
      context: await context(),
    });
    return { json: data.mpTestSetPreapprovalStatus };
  } catch (error) {
    return toError(error);
  }
};

export const mpTestCreatePayment = async (input: {
  amount: number;
  cardTokenId: string;
  payerEmail: string;
  paymentMethodId: string;
  issuerId?: string;
  identificationType?: string;
  identificationNumber?: string;
}): Promise<{ json: string } | { error: string }> => {
  if (!(await isAdmin())) return NOT_ADMIN;
  try {
    const { data } = await getClient().mutate({
      mutation: mpTestCreatePaymentMutation,
      variables: { input },
      context: await context(),
    });
    return { json: data.mpTestCreatePayment };
  } catch (error) {
    return toError(error);
  }
};

export const mpTestEvents = async (): Promise<
  { events: MpTestEvent[] } | { error: string }
> => {
  if (!(await isAdmin())) return NOT_ADMIN;
  try {
    const { data } = await getClient().query({
      query: mpTestEventsQuery,
      variables: { limit: 100 },
      context: await context(),
      fetchPolicy: "no-cache",
    });
    return { events: data.mpTestEvents };
  } catch (error) {
    return toError(error);
  }
};
