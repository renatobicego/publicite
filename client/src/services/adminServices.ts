"use server";

import { auth } from "@clerk/nextjs/server";

import {
  attachFacturaMutation,
  getAllInvoicesAdminQuery,
} from "@/graphql/adminQueries";
import { getClient } from "@/lib/client";
import {
  AdminInvoice,
  AdminInvoiceFilters,
  AdminInvoiceResponse,
} from "@/types/adminTypes";
import { handleApolloError } from "@/utils/functions/errorHandler";
import { getApiContext } from "./apiContext";
import { getAuthToken } from "./auth-token";

const NOT_ADMIN = { error: "No tenés permisos de administrador." };

/**
 * Chequeo de rol del lado del server action. Es una segunda barrera, no la
 * única: el resolver del BE valida el rol contra Clerk en cada request.
 */
const isAdmin = (): boolean => auth().sessionClaims?.metadata?.role === "admin";

export const getAllInvoicesAdmin = async (
  page: number,
  limit: number,
  filters?: AdminInvoiceFilters
): Promise<AdminInvoiceResponse | { error: string }> => {
  try {
    if (!isAdmin()) return NOT_ADMIN;

    const token = await getAuthToken();
    const { context } = await getApiContext(false, token);

    const {
      data: { getAllInvoicesAdmin: result },
    } = await getClient().query({
      query: getAllInvoicesAdminQuery,
      variables: { page, limit, filters: cleanFilters(filters) },
      context,
      fetchPolicy: "no-cache",
    });

    return result as AdminInvoiceResponse;
  } catch (error) {
    return handleApolloError(error);
  }
};

export const attachFacturaToInvoice = async (
  invoiceId: string,
  facturaUrl: string
): Promise<Partial<AdminInvoice> | { error: string }> => {
  try {
    if (!isAdmin()) return NOT_ADMIN;

    const token = await getAuthToken();
    const { context } = await getApiContext(false, token);

    const {
      data: { attachFacturaToInvoice: result },
    } = await getClient().mutate({
      mutation: attachFacturaMutation,
      variables: { input: { invoiceId, facturaUrl } },
      context,
    });

    return result as Partial<AdminInvoice>;
  } catch (error) {
    return handleApolloError(error);
  }
};

/**
 * GraphQL rechaza el input si mandamos strings vacíos donde espera enum/fecha,
 * así que los campos sin completar se sacan del objeto en vez de ir como "".
 */
const cleanFilters = (
  filters?: AdminInvoiceFilters
): AdminInvoiceFilters | undefined => {
  if (!filters) return undefined;

  const clean: AdminInvoiceFilters = {};
  if (filters.userSearch?.trim()) clean.userSearch = filters.userSearch.trim();
  if (filters.userId?.trim()) clean.userId = filters.userId.trim();
  if (filters.paymentStatus) clean.paymentStatus = filters.paymentStatus;
  if (filters.dateFrom) clean.dateFrom = filters.dateFrom;
  if (filters.dateTo) clean.dateTo = filters.dateTo;
  if (typeof filters.hasFactura === "boolean") {
    clean.hasFactura = filters.hasFactura;
  }

  return Object.keys(clean).length > 0 ? clean : undefined;
};
