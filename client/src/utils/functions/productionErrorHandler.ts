import { ApolloError } from "@apollo/client";

/**
 * Error de negocio de Producciones normalizado para mostrar al usuario.
 */
export interface ProductionActionError {
  error: string;
}

/**
 * Extrae el mensaje de error de negocio de Producciones.
 *
 * Estos errores llegan con HTTP 200 y `errors[0].message = "Http Exception"`;
 * el texto para el usuario viaja en `extensions.originalError`. Por eso
 * `handleApolloError` (que usa el statusCode HTTP) no sirve para estos casos.
 */
export const getProductionErrorMessage = (
  error: unknown
): string | undefined => {
  if (!(error instanceof ApolloError)) return undefined;
  const original = error.graphQLErrors?.[0]?.extensions?.originalError as any;
  const message =
    typeof original?.message === "string"
      ? original.message
      : original?.message?.message;
  // Los errores de validación de los inputs (class-validator) traen un array.
  return Array.isArray(message) ? message.join(". ") : message;
};

/** True si el valor es un error de acción de Producciones. */
export const isProductionActionError = (
  value: unknown
): value is ProductionActionError =>
  typeof value === "object" && value !== null && "error" in value;
