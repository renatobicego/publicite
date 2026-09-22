/** Tipos de la SeudoBase de Anuncios (gestión masiva de posts del usuario). */

export enum PostBulkAction {
  price = "price",
  visibility = "visibility",
  delete = "delete",
}

export enum PostPriceChangeMode {
  percentage = "percentage",
  fixed = "fixed",
}

/** Debe coincidir con el enum Visibility del backend (visibility.post). */
export enum PostVisibility {
  public = "public",
  registered = "registered",
  contacts = "contacts",
  friends = "friends",
  topfriends = "topfriends",
}

export enum PostSeudoBaseType {
  good = "good",
  service = "service",
  petition = "petition",
}

export interface PostSeudoBaseFilters {
  postTypes?: PostSeudoBaseType[];
  isActive?: boolean;
  searchTerm?: string;
}

export interface PostSeudoBaseRow {
  _id: string;
  postType: PostSeudoBaseType;
  title: string;
  imageUrl?: string | null;
  price: number;
  visibility: PostVisibility;
  isActive: boolean;
  endDate?: string | null;
  createdAt?: string | null;
}

export interface PostSeudoBase {
  rows: PostSeudoBaseRow[];
  total: number;
  hasMore: boolean;
}

export interface PostBulkResult {
  action: PostBulkAction;
  requested: number;
  affected: number;
  skipped: string[];
  auditId: string;
}

export interface PostBulkPriceInput {
  postIds: string[];
  confirm: boolean;
  mode: PostPriceChangeMode;
  value: number;
}

export interface PostBulkVisibilityInput {
  postIds: string[];
  confirm: boolean;
  visibility: PostVisibility;
}

export interface PostBulkDeleteInput {
  postIds: string[];
  confirm: boolean;
}

export interface PostSeudoBaseActionError {
  error: string;
}

export const isPostSeudoBaseActionError = (
  value: unknown
): value is PostSeudoBaseActionError =>
  typeof value === "object" &&
  value !== null &&
  "error" in value &&
  typeof (value as PostSeudoBaseActionError).error === "string";
