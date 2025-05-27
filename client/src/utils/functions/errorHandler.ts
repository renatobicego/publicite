import { ApolloError, ServerError } from "@apollo/client";

interface ErrorResponse {
    error: string;
  }
  
export function handleApolloError(error: unknown, ): ErrorResponse {
  
  console.log(error)
    if (error instanceof ApolloError && error.cause) {
        const { statusCode, result } = error.cause as ServerError;
        console.error((result as any)?.errors)
      
      switch (statusCode) {
        case 400:
          return { error: "Solicitud inválida. Por favor, verifica los datos ingresados." };
        case 401:
          return { error: "No estás autorizado. Por favor, inicia sesión nuevamente." };
        case 403:
          return { error: "No tienes permiso para realizar esta acción." };
        case 404:
          return { error: "El recurso solicitado no existe." };
        case 409:
          return { error: "Hubo un conflicto con el estado actual del recurso." };
        case 422:
          return { error: "No se pudo procesar la solicitud. Por favor, verifica los datos ingresados." };
        case 429:
          return { error: "Has realizado demasiadas solicitudes. Por favor, intenta más tarde." };
        case 500:
          return { error: "Error interno del servidor. Por favor, intenta más tarde." };
        default:
          return { error: "Ocurrió un error inesperado. Por favor, intenta de nuevo." };
      }
    }
    // For non-Apollo errors or errors without a status code
    return { error: "Error al procesar la solicitud. Por favor, intenta de nuevo." };
  }
  