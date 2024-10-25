"use client";
import { IoMdPersonAdd } from "react-icons/io";
import SecondaryButton from "../SecondaryButton";
import { getGroupAdminsById } from "@/services/groupsService";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { emitGroupNotification } from "@/components/notifications/groups/emitNotifications";
import { useSocket } from "@/app/socketProvider";

const SendRequestGroup = ({
  variant,
  removeMargin,
  groupId,
  usernameLogged,
}: {
  variant:
    | "light"
    | "solid"
    | "bordered"
    | "flat"
    | "faded"
    | "shadow"
    | "ghost";
  removeMargin: boolean;
  groupId: string;
  usernameLogged: string;
}) => {
  const { socket } = useSocket();
  const sendRequestJoinGroup = async () => {
    try {
      const group = await getGroupAdminsById(groupId);
      if (group.error) {
        toastifyError(
          "Error al enviar la solicitud. Por favor intenta de nuevo."
        );
        return;
      }
      const adminIds = group.admins.map((admin: any) => admin.id);
      const creatorId = group.creator;
      [...adminIds, creatorId].forEach((adminId) => {
        emitGroupNotification(
          socket,
          {
            _id: groupId,
            name: group.name,
            profilePhotoUrl: group.profilePhotoUrl,
          },
          usernameLogged,
          adminId,
          "notification_group_user_request_group_invitation"
        );
      });
      toastifySuccess("Solicitud enviada correctamente");
    } catch (error) {
      toastifyError(
        "Error al enviar la solicitud. Por favor intenta de nuevo."
      );
    }
  };
  return (
    <>
      <SecondaryButton
        variant={variant}
        className={`max-md:hidden mt-auto ${removeMargin && "-ml-4"}`}
        onPress={sendRequestJoinGroup}
      >
        Enviar solicitud
      </SecondaryButton>
      <SecondaryButton
        isIconOnly
        className="md:hidden p-0.5 mt-auto hover:text-secondary"
        size="sm"
        onPress={sendRequestJoinGroup}
      >
        <IoMdPersonAdd />
      </SecondaryButton>
    </>
  );
};

export default SendRequestGroup;
