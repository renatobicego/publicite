"use server";
import { getClient, query } from "@/lib/client";
import {
  getAllNoveltiesQuery,
  getNoveltyByIdQuery,
  createNewNoveltyMutation,
  updateNoveltyByIdMutation,
  deleteNoveltyByIdMutation,
} from "@/graphql/noveltyQueries";
import { getApiContext } from "./apiContext";
import {
  ErrorResponse,
  handleApolloError,
} from "@/utils/functions/errorHandler";
import { getAuthToken } from "./auth-token";
import { OutputData } from "@editorjs/editorjs";

export interface NoveltyBlock {
  type: string;
  data: string;
}

export interface NoveltyProperty {
  key: string;
  value: string;
}

export interface NoveltyResponse {
  _id: string;
  blocks: NoveltyBlock[];
  createdAt: string;
  updatedAt: string;
  properties: NoveltyProperty[];
}

export interface NoveltyRequest {
  blocks: { type: string; data: string }[];
  properties?: { key: string; value: string }[];
}

export interface NoveltyUpdateRequest {
  _id: string;
  blocks?: { type: string; data: string }[];
  properties?: { key: string; value: string }[];
}

/**
 * Parse blocks from backend (stringified JSON) to EditorJS format
 */
export async function parseNoveltyBlocks(
  blocks: NoveltyBlock[]
): Promise<OutputData> {
  return {
    time: new Date().getTime(),
    blocks: blocks.map((block, index) => ({
      id: `block_${index}`,
      type: block.type as any,
      data: JSON.parse(block.data),
    })),
  } as OutputData;
}

/**
 * Convert EditorJS blocks to backend format (stringify data)
 */
export async function formatNoveltyBlocks(
  editorData: OutputData
): Promise<{ type: string; data: string }[]> {
  return editorData.blocks.map((block) => ({
    type: block.type,
    data: JSON.stringify(block.data),
  }));
}

export const getAllNovelties = async (): Promise<
  NoveltyResponse[] | ErrorResponse
> => {
  try {
    const tokenCache = await getAuthToken();
    const { context } = await getApiContext(true, tokenCache);
    const { data } = await query({
      query: getAllNoveltiesQuery,
      context,
    });
    return data.getAllNovelties;
  } catch (error) {
    return handleApolloError(error);
  }
};

export const getNoveltyById = async (
  id: string
): Promise<NoveltyResponse | null | ErrorResponse> => {
  try {
    const tokenCache = await getAuthToken();
    const { context } = await getApiContext(true, tokenCache);
    const { data } = await query({
      query: getNoveltyByIdQuery,
      variables: { id },
      context,
    });
    return data.getNoveltyById;
  } catch (error) {
    return handleApolloError(error);
  }
};

export const createNovelty = async (
  noveltyData: NoveltyRequest
): Promise<NoveltyResponse | ErrorResponse> => {
  try {
    const tokenCache = await getAuthToken();
    const payload = {
      blocks: noveltyData.blocks,
      properties: [{
        value: new Date(),
        key: 'date'
      }]
    }
    const { context } = await getApiContext(false, tokenCache);
    const { data } = await getClient().mutate({
      mutation: createNewNoveltyMutation,
      variables: {
        noveltyDto: payload,
      },
      context,
    });
    return data.createNewNovelty;
  } catch (error) {
    return handleApolloError(error);
  }
};

export const updateNovelty = async (
  noveltyData: NoveltyUpdateRequest
): Promise<string | ErrorResponse> => {
  try {
    const tokenCache = await getAuthToken();
    const { context } = await getApiContext(false, tokenCache);
    const { data } = await getClient().mutate({
      mutation: updateNoveltyByIdMutation,
      variables: {
        noveltyToUpdate: noveltyData,
      },
      context,
    });
    return data.updateNoveltyById;
  } catch (error) {
    return handleApolloError(error);
  }
};

export const deleteNovelty = async (
  id: string
): Promise<string | ErrorResponse> => {
  try {
    const tokenCache = await getAuthToken();
    const { context } = await getApiContext(false, tokenCache);
    const { data } = await getClient().mutate({
      mutation: deleteNoveltyByIdMutation,
      variables: { id },
      context,
    });
    return data.deleteNoveltyById;
  } catch (error) {
    return handleApolloError(error);
  }
};
