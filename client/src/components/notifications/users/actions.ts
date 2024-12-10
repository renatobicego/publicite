import { Group } from "@/types/groupTypes";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { Socket } from "socket.io-client";
import { User } from "@/types/userTypes";
import { emitUserRelationNotification } from "./emitNotifications";

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
  );
  toastifySuccess("Solicitud aceptada correctamente");
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
  );
  toastifySuccess("Solicitud rechazada correctamente");
};

const acceptChangeContactRequest = async (
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
    "notification_user_new_relation_accepted",
    userIdTo,
    typeRelation,
    previousNotificationId
  );
  toastifySuccess("Solicitud aceptada correctamente");
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
  );
  toastifySuccess("Solicitud rechazada correctamente");
};

export {
  acceptNewContactRequest,
  declineNewContactRequest,
  acceptChangeContactRequest,
  rejectChangeContactRequest,
};
