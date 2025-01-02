import { toastifyError } from "@/utils/functions/toastify";

export const handlePostActivityNotificationError = (error: Error) => {
  switch (error.message as NotificationError) {
    case "NOTIFICATION_ALREADY_EXISTS":
      toastifyError("Ya tienes una solicitud pendiente.");
      break;
    case "USER_NOT_AUTHORIZED":
      toastifyError("No tienes autorización para realizar esta acción.");
      break;
    case "NOTIFICATION_ERROR_BACKEND_INTERNAL_ERROR":
      toastifyError(
        "Error al enviar la solicitud. Por favor intenta de nuevo."
      );
      break;
    case "PREVIOUS_ID_MISSING":
      toastifyError("La solicitud no existe. Por favor intenta de nuevo.");
      break;
    default:
      toastifyError(
        "Error al enviar la solicitud. Por favor intenta de nuevo."
      );
      break;
  }
};
