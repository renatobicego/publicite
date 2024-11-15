import { useUserData } from "@/app/(root)/providers/userDataProvider";
import { useSocket } from "@/app/socketProvider";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { emitGroupNotification } from "@/components/notifications/groups/emitNotifications";
import { putMemberGroupByRequest } from "@/services/groupsService";
import { Group } from "@/types/groupTypes";
import { User } from "@/types/userTypes";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { Button } from "@nextui-org/react";
import { useRouter } from "next-nprogress-bar";
import { emit } from "process";
import { FaCheck, FaX } from "react-icons/fa6";

const HandleGroupRequest = ({ user, group }: { user: User; group: Group }) => {
  const { updateSocketToken } = useSocket();
  const router = useRouter();
  const { usernameLogged, userIdLogged } = useUserData();
  const handleAcceptRequest = async () => {
    const res = await putMemberGroupByRequest(group._id, user._id);
    if ("error" in res) {
      toastifyError(res.error as string);
      return;
    }
    const socket = await updateSocketToken();

    emitGroupNotification(
      socket,
      {
        _id: group._id,
        name: group.name,
        profilePhotoUrl: group.profilePhotoUrl,
      },
      { username: usernameLogged as string, _id: userIdLogged as string },
      user._id,
      "notification_group_user_accepted"
    );
    toastifySuccess("Solicitud aceptada correctamente");
    router.refresh();
  };
  const rejectRequest = async() => {
    const socket = await updateSocketToken();

    emitGroupNotification(
      socket,
      {
        _id: group._id,
        name: group.name,
        profilePhotoUrl: group.profilePhotoUrl,
      },
      { username: usernameLogged as string, _id: userIdLogged as string },
      user._id,
      "notification_group_user_rejected"
    );
    toastifySuccess("Solicitud rechazada correctamente");
    router.refresh();
  };
  return (
    <div className="flex gap-2 items-center">
      <ConfirmModal
        ButtonAction={
          <Button
            size="sm"
            isIconOnly
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
