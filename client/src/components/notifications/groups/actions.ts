import { putMemberGroup } from "@/services/groupsService";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { Socket } from "socket.io-client";

const acceptGroupInvitation = async (groupId: string) => {
  const res = await putMemberGroup(groupId);
  if (res.error) {
    toastifyError(res.error as string);
    return;
  }
  toastifySuccess(res.message as string);
};
const declineGroupInvitation = async (
  groupId: string,
  socket: Socket | null
) => {
  if (!socket) {
    toastifyError(
      "Error al enviar la solicitud. Por favor recarga la página e intenta de nuevo."
    );
    return;
  }
  console.log("declineGroupInvitation");
};

const acceptNewMember = async (groupId: string, memberId: string) => {
  console.log("acceptNewMember");
};

const declineNewMember = async (groupId: string, memberId: string) => {
  console.log("declineNewMember");
};

export {
  acceptGroupInvitation,
  declineGroupInvitation,
  acceptNewMember,
  declineNewMember,
};
