"use server";

import {
  activatePlanGiftMutation,
  buyPlanGiftMutation,
  claimPlanGiftMutation,
  myPlanGiftsQuery,
  planGiftByCodeQuery,
  planGiftQuoteQuery,
  planGiftsAdminQuery,
  updatePlanGiftEmailMutation,
} from "@/graphql/planGiftQueries";
import { getClient } from "@/lib/client";
import {
  AdminPlanGift,
  BuyPlanGiftInput,
  BuyPlanGiftResult,
  PlanGift,
  PlanGiftPublic,
  PlanGiftQuote,
} from "@/types/planGiftTypes";
import { getProductionErrorMessage } from "@/utils/functions/productionErrorHandler";
import { getApiContext } from "./apiContext";
import { getAuthToken } from "./auth-token";

/*
Regalo de planes. El server decide el monto (precio mensual del plan en MP ×
meses) y el usuario sale del token: el cliente sólo manda el plan, los meses, el
destinatario y el token de la tarjeta del Brick.
*/

type Result<T> = T | { error: string };

const authContext = async () =>
  (await getApiContext(false, await getAuthToken())).context;

const toError = (error: unknown, fallback: string) => {
  console.error(error);
  return { error: getProductionErrorMessage(error) ?? fallback };
};

export const getPlanGiftQuote = async (
  mpPreapprovalPlanId: string,
  months: number
): Promise<Result<PlanGiftQuote>> => {
  try {
    const { data } = await getClient().query({
      query: planGiftQuoteQuery,
      variables: { mpPreapprovalPlanId, months },
      context: await authContext(),
      fetchPolicy: "no-cache",
    });
    return data.planGiftQuote;
  } catch (error) {
    return toError(error, "No pudimos calcular el precio del regalo.");
  }
};

export const buyPlanGift = async (
  input: BuyPlanGiftInput
): Promise<Result<BuyPlanGiftResult>> => {
  try {
    const { data } = await getClient().mutate({
      mutation: buyPlanGiftMutation,
      variables: { input },
      context: await authContext(),
    });
    return data.buyPlanGift;
  } catch (error) {
    return toError(error, "No pudimos procesar el pago. Por favor intentá de nuevo.");
  }
};

/** Link público: funciona sin cuenta (token de no registrado). */
export const getPlanGiftByCode = async (
  code: string
): Promise<Result<PlanGiftPublic>> => {
  try {
    const { data } = await getClient().query({
      query: planGiftByCodeQuery,
      variables: { code },
      context: (await getApiContext(true)).context,
      fetchPolicy: "no-cache",
    });
    return data.planGiftByCode;
  } catch (error) {
    return toError(error, "No encontramos ese regalo. Revisá el link.");
  }
};

export const claimPlanGift = async (code: string): Promise<Result<PlanGift>> => {
  try {
    const { data } = await getClient().mutate({
      mutation: claimPlanGiftMutation,
      variables: { code },
      context: await authContext(),
    });
    return data.claimPlanGift;
  } catch (error) {
    return toError(error, "No pudimos tomar el regalo.");
  }
};

export const activatePlanGift = async (giftId: string): Promise<Result<PlanGift>> => {
  try {
    const { data } = await getClient().mutate({
      mutation: activatePlanGiftMutation,
      variables: { giftId },
      context: await authContext(),
    });
    return data.activatePlanGift;
  } catch (error) {
    return toError(error, "No pudimos activar el regalo.");
  }
};

export const updatePlanGiftEmail = async (
  giftId: string,
  email: string
): Promise<Result<PlanGift>> => {
  try {
    const { data } = await getClient().mutate({
      mutation: updatePlanGiftEmailMutation,
      variables: { giftId, email },
      context: await authContext(),
    });
    return data.updatePlanGiftEmail;
  } catch (error) {
    return toError(error, "No pudimos cambiar el email.");
  }
};

export const getMyPlanGifts = async (): Promise<
  Result<{ given: PlanGift[]; received: PlanGift[] }>
> => {
  try {
    const { data } = await getClient().query({
      query: myPlanGiftsQuery,
      context: await authContext(),
      fetchPolicy: "no-cache",
    });
    return data.myPlanGifts;
  } catch (error) {
    return toError(error, "No pudimos traer tus regalos.");
  }
};

export const getPlanGiftsAdmin = async (
  page: number,
  limit: number
): Promise<Result<{ gifts: AdminPlanGift[]; hasMore: boolean }>> => {
  try {
    const { data } = await getClient().query({
      query: planGiftsAdminQuery,
      variables: { page, limit },
      context: await authContext(),
      fetchPolicy: "no-cache",
    });
    return data.planGiftsAdmin;
  } catch (error) {
    return toError(error, "No pudimos traer los regalos.");
  }
};
