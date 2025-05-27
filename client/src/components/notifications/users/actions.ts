import {
  toastifyError,
  toastifySuccess,
  toastifyWarn,
} from "@/utils/functions/toastify";
import { Socket } from "socket.io-client";
import { emitUserRelationNotification } from "./emitNotifications";
import { setActiveRelations } from "@/app/(root)/providers/slices/configSlice";
import { getActiveRelations } from "@/services/postsServices";

const handleUserRelationNotificationError = (error: Error) => {
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
    case "RELATION_EXISTS" as NotificationError:
      toastifyWarn("La relación ya existe.");
      break;
    default:
      toastifyError(
        "Error al enviar la solicitud. Por favor intenta de nuevo."
      );
      break;
  }
};

const acceptNewContactRequest = async (
  socket: Socket | null,
  userIdTo: string,
  typeRelation: UserRelation,
  previousNotificationId: string
) => {
  if (!socket) {
    toastifyError(
      "Error al enviar la solicitud. Por favor recarga la página e intenta de nuevo."
    );
    return;
  }
  emitUserRelationNotification(
    socket,
    "notification_user_friend_request_accepted",
    userIdTo,
    typeRelation,
    previousNotificationId
  )
    .then(async () => {
      toastifySuccess("Solicitud aceptada correctamente");
      const newActiveRelations = await getActiveRelations();
      if (!("error" in newActiveRelations)) {
        setActiveRelations(newActiveRelations);
      }
    })
    .catch(handleUserRelationNotificationError);
};
const declineNewContactRequest = async (
  socket: Socket | null,
  userIdTo: string,
  typeRelation: UserRelation,
  previousNotificationId: string | null
) => {
  if (!socket) {
    toastifyError(
      "Error al enviar la solicitud. Por favor recarga la página e intenta de nuevo."
    );
    return;
  }
  emitUserRelationNotification(
    socket,
    "notification_user_friend_request_rejected",
    userIdTo,
    typeRelation,
    previousNotificationId
  )
    .then(() => toastifySuccess("Solicitud rechazada correctamente"))
    .catch(handleUserRelationNotificationError);
};

const acceptChangeContactRequest = async (
  socket: Socket | null,
  userIdTo: string,
  typeRelation: UserRelation,
  previousNotificationId: string,
  userRelationId?: string
) => {
  if (!socket) {
    toastifyError(
      "Error al enviar la solicitud. Por favor recarga la página e intenta de nuevo."
    );
    return;
  }
  emitUserRelationNotification(
    socket,
    "notification_user_new_relation_accepted",
    userIdTo,
    typeRelation,
    previousNotificationId,
    userRelationId
  )
    .then(() => toastifySuccess("Solicitud aceptada correctamente"))
    .catch(handleUserRelationNotificationError);
};

const rejectChangeContactRequest = async (
  socket: Socket | null,
  userIdTo: string,
  typeRelation: UserRelation,
  previousNotificationId: string
) => {
  if (!socket) {
    toastifyError(
      "Error al enviar la solicitud. Por favor recarga la página e intenta de nuevo."
    );
    return;
  }
  emitUserRelationNotification(
    socket,
    "notifications_user_new_relation_rejected",
    userIdTo,
    typeRelation,
    previousNotificationId
  )
    .then(() => toastifySuccess("Solicitud rechazada correctamente"))
    .catch(handleUserRelationNotificationError);
};

export {
  acceptNewContactRequest,
  declineNewContactRequest,
  acceptChangeContactRequest,
  rejectChangeContactRequest,
  handleUserRelationNotificationError,
};
