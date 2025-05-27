import { Socket } from "socket.io-client";
import { emitMagazineNotification } from "./emitNotifications";
import { Magazine } from "@/types/magazineTypes";
import { User } from "@/types/userTypes";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";

const handleMagazineNotificationError = (error: Error) => {
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
const acceptMagazineInvitation = async (
  socket: Socket | null,
  magazine: Pick<Magazine, "_id" | "name" | "ownerType">,
  userSending: Pick<User, "_id" | "username">,
  userIdTo: string,
  previousNotificationId: string | null
) => {
  if (!socket) return;
  emitMagazineNotification(
    socket,
    magazine,
    userSending,
    userIdTo,
    "notification_magazine_acepted",
    previousNotificationId
  )
    .then(() => toastifySuccess("Invitación aceptada"))
    .catch(handleMagazineNotificationError);
};
const declineMagazineInvitation = async (
  socket: Socket | null,
  magazine: Pick<Magazine, "_id" | "name" | "ownerType">,
  userSending: Pick<User, "_id" | "username">,
  userIdTo: string,
  previousNotificationId: string | null
) => {
  if (!socket) return;
  emitMagazineNotification(
    socket,
    magazine,
    userSending,
    userIdTo,
    "notification_magazine_rejected",
    previousNotificationId
  )
    .then(() => toastifySuccess("Invitación rechazada"))
    .catch(handleMagazineNotificationError);
};

export {
  acceptMagazineInvitation,
  declineMagazineInvitation,
  handleMagazineNotificationError,
};
