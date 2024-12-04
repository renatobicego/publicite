import { Socket } from "socket.io-client";
import { emitMagazineNotification } from "./emitNotifications";
import { Magazine } from "@/types/magazineTypes";
import { User } from "@/types/userTypes";
import { toastifySuccess } from "@/utils/functions/toastify";

const acceptMagazineInvitation = async (
  socket: Socket | null,
  magazine: Pick<Magazine, "_id" | "name" | "ownerType">,
  userSending: Pick<User, "_id" | "username">,
  userIdTo: string,
  previousNotificationId: string | null
) => {
  if(!socket) return
  emitMagazineNotification(
    socket,
    magazine,
    userSending,
    userIdTo,
    "notification_magazine_acepted",
    previousNotificationId
  );
  toastifySuccess("Invitación aceptada");
};
const declineMagazineInvitation = async (
  socket: Socket | null,
  magazine: Pick<Magazine, "_id" | "name" | "ownerType">,
  userSending: Pick<User, "_id" | "username">,
  userIdTo: string,
  previousNotificationId: string | null
) => {
  if(!socket) return
  emitMagazineNotification(
    socket,
    magazine,
    userSending,
    userIdTo,
    "notification_magazine_rejected",
    previousNotificationId
  );
  toastifySuccess("Invitación rechazada");
};

export { acceptMagazineInvitation, declineMagazineInvitation };
