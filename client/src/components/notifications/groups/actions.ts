import { putMemberGroup } from "@/services/groupsService";
import { Group } from "@/types/groupTypes";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { Socket } from "socket.io-client";
import { emitGroupNotification } from "./emitNotifications";
import { User } from "@/types/userTypes";
const handleGroupNotificationError = (error: Error) => {
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

const acceptGroupInvitation = async (
  socket: Socket | null,
  group: Pick<Group, "_id" | "name" | "profilePhotoUrl">,
  userSending: Pick<User, "_id" | "username">,
  userIdTo: string,
  previousNotificationId: string
) => {
  if (!socket) {
    toastifyError(
      "Error al enviar la solicitud. Por favor recarga la página e intenta de nuevo."
    );
    return;
  }
  emitGroupNotification(
    socket,
    group,
    userSending,
    userIdTo,
    "notification_group_new_user_added",
    previousNotificationId
  )
    .then(() => toastifySuccess("Solicitud aceptada correctamente"))
    .catch(handleGroupNotificationError);
};
const declineGroupInvitation = async (
  socket: Socket | null,
  group: Pick<Group, "_id" | "name" | "profilePhotoUrl">,
  userSending: Pick<User, "_id" | "username">,
  userIdTo: string,
  previousNotificationId: string | null
) => {
  if (!socket) {
    toastifyError(
      "Error al enviar la solicitud. Por favor recarga la página e intenta de nuevo."
    );
    return;
  }
  emitGroupNotification(
    socket,
    group,
    userSending,
    userIdTo,
    "notification_group_user_rejected_group_invitation",
    previousNotificationId
  )
    .then(() => toastifySuccess("Solicitud rechazada correctamente"))
    .catch(handleGroupNotificationError);
};

export {
  acceptGroupInvitation,
  declineGroupInvitation,
  handleGroupNotificationError,
};
