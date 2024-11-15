import { Socket } from "socket.io-client";
import { emitMagazineNotification } from "./emitNotifications";
import { Magazine } from "@/types/magazineTypes";
import { User } from "@/types/userTypes";

const acceptMagazineInvitation = async (
  socket: Socket | null,
  magazine: Pick<Magazine, "_id" | "name" | "ownerType">,
  userSending: Pick<User, "_id" | "username">,
  userIdTo: string
) => {
  if(!socket) return
  emitMagazineNotification(
    socket,
    magazine,
    userSending,
    userIdTo,
    "notification_magazine_acepted"
  );
};
const declineMagazineInvitation = async (
  magazineId: string,
  socket: Socket | null
) => {
  // if (!socket) {
  //   toastifyError(
  //     "Error al enviar la solicitud. Por favor recarga la página e intenta de nuevo."
  //   );
  //   return;
  // }
  // console.log("declineGroupInvitation");
};

export { acceptMagazineInvitation, declineMagazineInvitation };
