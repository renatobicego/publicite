import { Group } from "@/types/groupTypes";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { Socket } from "socket.io-client";
import { User } from "@/types/userTypes";

const acceptNewContactRequest = async (
  socket: Socket | null,
  group: Pick<Group, "_id" | "name" | "profilePhotoUrl">,
  userSending: Pick<User, "_id" | "username">,
  userIdTo: string,
  previousNotificationId: string
) => {
  // // const res = await putMemberGroup(group._id);
  // // if (res.error) {
  // //   return;
  // // }
  // if (!socket) {
  //   toastifyError(
  //     "Error al enviar la solicitud. Por favor recarga la página e intenta de nuevo."
  //   );
  //   return;
  // }
  // emitGroupNotification(
  //   socket,
  //   group,
  //   userSending,
  //   userIdTo,
  //   "notification_group_new_user_added",
  //   previousNotificationId
  // );
  // toastifySuccess("Solicitud aceptada correctamente");
};
const declineNewContactRequest = async (
  socket: Socket | null,
  group: Pick<Group, "_id" | "name" | "profilePhotoUrl">,
  userSending: Pick<User, "_id" | "username">,
  userIdTo: string,
  previousNotificationId: string | null
) => {
  // if (!socket) {
  //   toastifyError(
  //     "Error al enviar la solicitud. Por favor recarga la página e intenta de nuevo."
  //   );
  //   return;
  // }
  // emitGroupNotification(
  //   socket,
  //   group,
  //   userSending,
  //   userIdTo,
  //   "notification_group_user_rejected_group_invitation",
  //   previousNotificationId
  // );
};

const acceptChangeContactRequest = async (
  socket: Socket | null,
  group: Pick<Group, "_id" | "name" | "profilePhotoUrl">,
  userSending: Pick<User, "_id" | "username">,
  userIdTo: string,
  previousNotificationId: string
) => {
  // // const res = await putMemberGroup(group._id);
  // // if (res.error) {
  // //   return;
  // // }
  // if (!socket) {
  //   toastifyError(
  //     "Error al enviar la solicitud. Por favor recarga la página e intenta de nuevo."
  //   );
  //   return;
  // }
  // emitGroupNotification(
  //   socket,
  //   group,
  //   userSending,
  //   userIdTo,
  //   "notification_group_new_user_added",
  //   previousNotificationId
  // );
  // toastifySuccess("Solicitud aceptada correctamente");
};

const rejectChangeContactRequest = async (
  socket: Socket | null,
  group: Pick<Group, "_id" | "name" | "profilePhotoUrl">,
  userSending: Pick<User, "_id" | "username">,
  userIdTo: string,
  previousNotificationId: string
) => {
  // // const res = await putMemberGroup(group._id);
  // // if (res.error) {
  // //   return;
  // // }
  // if (!socket) {
  //   toastifyError(
  //     "Error al enviar la solicitud. Por favor recarga la página e intenta de nuevo."
  //   );
  //   return;
  // }
  // emitGroupNotification(
  //   socket,
  //   group,
  //   userSending,
  //   userIdTo,
  //   "notification_group_new_user_added",
  //   previousNotificationId
  // );
  // toastifySuccess("Solicitud aceptada correctamente");
};

export {
  acceptNewContactRequest,
  declineNewContactRequest,
  acceptChangeContactRequest,
  rejectChangeContactRequest,
};
