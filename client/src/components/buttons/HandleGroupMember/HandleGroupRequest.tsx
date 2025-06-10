import { useUserData } from "@/app/(root)/providers/userDataProvider";
import { useSocket } from "@/app/socketProvider";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { handleGroupNotificationError } from "@/components/notifications/groups/actions";
import { emitGroupNotification } from "@/components/notifications/groups/emitNotifications";
import { putMemberGroupByRequest } from "@/services/groupsService";
import { Group } from "@/types/groupTypes";
import { User } from "@/types/userTypes";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { Button } from "@nextui-org/react";
import { useState } from "react";
import { FaCheck, FaX } from "react-icons/fa6";

const HandleGroupRequest = ({ user, group }: { user: User; group: Group }) => {
  const { socket } = useSocket();
  const [isActionDone, setIsActionDone] = useState(false);
  const { usernameLogged, userIdLogged } = useUserData();
  const handleAcceptRequest = async () => {
    const res = await putMemberGroupByRequest(group._id, user._id);
    if ("error" in res) {
      toastifyError(res.error as string);
      return;
    }

    emitGroupNotification(
      socket,
      group,
      { username: usernameLogged as string, _id: userIdLogged as string },
      user._id,
      "notification_group_user_accepted",
      null
    )
      .then(() => {
        toastifySuccess("Solicitud aceptada correctamente");
        setIsActionDone(true);
      })
      .catch(handleGroupNotificationError);
  };
  const rejectRequest = async () => {
    emitGroupNotification(
      socket,
      group,
      { username: usernameLogged as string, _id: userIdLogged as string },
      user._id,
      "notification_group_user_rejected",
      null
    )
      .then(() => {
        toastifySuccess("Solicitud rechazada correctamente");
        setIsActionDone(true);
      })
      .catch(handleGroupNotificationError);
  };
  if (isActionDone) return null;
  return (
    <div className="flex gap-2 items-center">
      <ConfirmModal
        ButtonAction={
          <Button
            size="sm"
            isIconOnly
            aria-label="Aceptar Solicitud"
            color="secondary"
            variant="flat"
            radius="full"
          >
            <FaCheck />
          </Button>
        }
        message={`¿Desea aceptar la solicitud de grupo?`}
        tooltipMessage="Aceptar"
        confirmText="Aceptar"
        onConfirm={handleAcceptRequest}
      />
      <ConfirmModal
        ButtonAction={
          <Button
            size="sm"
            isIconOnly
            aria-label="Rechazar Solicitud"
            color="danger"
            variant="flat"
            radius="full"
          >
            <FaX />
          </Button>
        }
        message={`¿Desea rechazar la solicitud de grupo?`}
        tooltipMessage="Rechazar"
        confirmText="Rechazar"
        onConfirm={rejectRequest}
      />
    </div>
  );
};

export default HandleGroupRequest;
