"use server";
import { getClient, query } from "@/lib/client";
import { getApiContext } from "@/services/apiContext";
import { getAuthToken } from "@/services/auth-token";
import { handleApolloError } from "@/utils/functions/errorHandler";
import { ApolloError } from "@apollo/client";
import {
  getPostSeudoBaseQuery,
  bulkUpdatePostPricesMutation,
  bulkUpdatePostVisibilityMutation,
  bulkDeletePostsMutation,
} from "@/graphql/postSeudoBaseQueries";
import {
  PostBulkDeleteInput,
  PostBulkPriceInput,
  PostBulkResult,
  PostBulkVisibilityInput,
  PostSeudoBase,
  PostSeudoBaseActionError,
  PostSeudoBaseFilters,
} from "@/types/postSeudoBaseTypes";

/** Tabla tipo Excel de los anuncios del usuario logueado. */
export const getPostSeudoBase = async (
  filters?: PostSeudoBaseFilters,
  page?: number,
  limit?: number
): Promise<PostSeudoBase | PostSeudoBaseActionError> => {
  try {
    const tokenCache = await getAuthToken();
    const { context } = await getApiContext(false, tokenCache);
    const { data } = await query({
      query: getPostSeudoBaseQuery,
      variables: { filters, page, limit },
      context,
      fetchPolicy: "network-only",
    });
    return data.getPostSeudoBase;
  } catch (error: ApolloError | any) {
    return handleApolloError(error);
  }
};

export const bulkUpdatePostPrices = async (
  input: PostBulkPriceInput
): Promise<PostBulkResult | PostSeudoBaseActionError> => {
  try {
    const tokenCache = await getAuthToken();
    const { context } = await getApiContext(false, tokenCache);
    const { data } = await getClient().mutate({
      mutation: bulkUpdatePostPricesMutation,
      variables: { input },
      context,
    });
    return data.bulkUpdatePostPrices;
  } catch (error: ApolloError | any) {
    return handleApolloError(error);
  }
};

export const bulkUpdatePostVisibility = async (
  input: PostBulkVisibilityInput
): Promise<PostBulkResult | PostSeudoBaseActionError> => {
  try {
    const tokenCache = await getAuthToken();
    const { context } = await getApiContext(false, tokenCache);
    const { data } = await getClient().mutate({
      mutation: bulkUpdatePostVisibilityMutation,
      variables: { input },
      context,
    });
    return data.bulkUpdatePostVisibility;
  } catch (error: ApolloError | any) {
    return handleApolloError(error);
  }
};

export const bulkDeletePosts = async (
  input: PostBulkDeleteInput
): Promise<PostBulkResult | PostSeudoBaseActionError> => {
  try {
    const tokenCache = await getAuthToken();
    const { context } = await getApiContext(false, tokenCache);
    const { data } = await getClient().mutate({
      mutation: bulkDeletePostsMutation,
      variables: { input },
      context,
    });
    return data.bulkDeletePosts;
  } catch (error: ApolloError | any) {
    return handleApolloError(error);
  }
};
