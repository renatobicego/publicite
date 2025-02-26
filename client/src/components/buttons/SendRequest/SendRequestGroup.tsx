"use client";
import { IoMdPersonAdd } from "react-icons/io";
import SecondaryButton from "../SecondaryButton";
import { getGroupAdminsById } from "@/services/groupsService";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { emitGroupNotification } from "@/components/notifications/groups/emitNotifications";
import { useSocket } from "@/app/socketProvider";
import { useUserData } from "@/app/(root)/providers/userDataProvider";
import { useState } from "react";
import { handleGroupNotificationError } from "@/components/notifications/groups/actions";

const SendRequestGroup = ({
  variant,
  removeMargin,
  groupId,
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
}) => {
  const { usernameLogged, userIdLogged } = useUserData();
  const { updateSocketToken } = useSocket();
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sendRequestJoinGroup = async () => {
    setIsSubmitting(true);
    try {
      const group = await getGroupAdminsById(groupId);
      if (group.error) {
        toastifyError(
          "Error al enviar la solicitud. Por favor intenta de nuevo."
        );
        return;
      }
      const adminIds = group.admins.map((admin: any) => admin._id);
      const creatorId = group.creator._id;
      const socket = await updateSocketToken();

      [...adminIds, creatorId].forEach((adminId) => {
        emitGroupNotification(
          socket,
          group,
          { username: usernameLogged as string, _id: userIdLogged as string },
          adminId,
          "notification_group_user_request_group_invitation",
          null
        )
          .then(() => {
            toastifySuccess("Solicitud enviada correctamente");
          })
          .catch(handleGroupNotificationError);
      });
      setIsRequestSent(true);
    } catch (error) {
      toastifyError(
        "Error al enviar la solicitud. Por favor intenta de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isRequestSent) {
    return (
      <p className="text-sm lg:text-small text-light-text">Solicitud Enviada</p>
    );
  }
  return (
    <>
      <SecondaryButton
        variant={variant}
        isLoading={isSubmitting}
        isDisabled={isSubmitting}
        className={`max-md:hidden mt-auto ${removeMargin && "md:-ml-4"}`}
        onPress={sendRequestJoinGroup}
      >
        Enviar solicitud
      </SecondaryButton>
      <SecondaryButton
        isIconOnly
        aria-label="Enviar solicitud"
        isLoading={isSubmitting}
        isDisabled={isSubmitting}
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
