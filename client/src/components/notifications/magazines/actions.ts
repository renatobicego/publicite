import { putMemberGroup } from "@/services/groupsService";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { Socket } from "socket.io-client";

const acceptMagazineInvitation = async (magazineId: string) => {
  // const res = await putMemberGroup(magazineId);
  // if (res.error) {
  //   toastifyError(res.error as string);
  //   return;
  // }
  // toastifySuccess(res.message as string);
  console.log("accept")
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
