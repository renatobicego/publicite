import { Socket } from "socket.io-client";
import { User } from "@/types/userTypes";
import { PetitionContactSeller } from "@/types/postTypes";
import generateContactSellerNotification from "./generateContactSellerNotification";

export const emitContactSellerNotification = (
  socket: Socket | null,
  post: ObjectId,
  userIdTo: string,
  client: PetitionContactSeller,
  userSending: Pick<User, "_id" | "username"> | null
): Promise<{ status?: number; message?: string }> => {
  return new Promise((resolve, reject) => {
    const notification = generateContactSellerNotification(
      post,
      userIdTo,
      client,
      userSending
    );
    console.log(notification);
    socket?.emit(
      "contact_seller_notifications",
      notification,
      (response: { status?: number; message?: string }) => {
        console.log(response);
        if (response?.status === 200) {
          resolve(response);
        } else {
          reject(
            new Error(response?.message || "Error al enviar la notificación.")
          );
        }
      }
    );
  });
};
