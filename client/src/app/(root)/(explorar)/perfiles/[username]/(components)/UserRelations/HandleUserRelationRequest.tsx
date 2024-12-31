import { useSocket } from "@/app/socketProvider";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { emitUserRelationNotification } from "@/components/notifications/users/emitNotifications";
import {
  UserRelationNotification,
  UserRelationNotificationType,
} from "@/types/userTypes";
import { toastifySuccess } from "@/utils/functions/toastify";
import { Button } from "@nextui-org/react";
import { useRouter } from "next-nprogress-bar";
import { FaCheck, FaX } from "react-icons/fa6";

const HandleUserRelationRequest = ({
  userRelation,
}: {
  userRelation: UserRelationNotification;
}) => {
  const { updateSocketToken } = useSocket();
  const { event } = userRelation;
  const isChangeOfRelation =
    (event as UserRelationNotificationType) ===
    "notification_user_new_relation_change";
  const router = useRouter();
  const handleAcceptRequest = async () => {
    const socket = await updateSocketToken();
    emitUserRelationNotification(
      socket,
      isChangeOfRelation
        ? "notification_user_new_relation_accepted"
        : "notification_user_friend_request_accepted",
      userRelation.backData.userIdFrom,
      userRelation.frontData.userRelation.typeRelation,
      userRelation._id,
      userRelation.frontData.userRelation._id
    );
    if (isChangeOfRelation) {
      toastifySuccess("Cambio de relación aceptado");
      return;
    }
    toastifySuccess("Solicitud aceptada correctamente");
    router.refresh();
  };
  const rejectRequest = async () => {
    const socket = await updateSocketToken();
    emitUserRelationNotification(
      socket,
      isChangeOfRelation
        ? "notifications_user_new_relation_rejected"
        : "notification_user_friend_request_rejected",
      userRelation.backData.userIdFrom,
      userRelation.frontData.userRelation.typeRelation,
      userRelation._id
    );
    if (isChangeOfRelation) {
      toastifySuccess("Cambio de relación rechazado");
      return;
    }
    toastifySuccess("Solicitud rechazada");
    router.refresh();
  };
  return (
    <div className="flex gap-2 items-center">
      <ConfirmModal
        ButtonAction={
          <Button
            size="sm"
            isIconOnly
            aria-label="Aceptar solicitud"
            color="secondary"
            variant="flat"
            radius="full"
          >
            <FaCheck />
          </Button>
        }
        message={`¿Desea aceptar la solicitud?`}
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
            aria-label="Rechazar solicitud"
            radius="full"
          >
            <FaX />
          </Button>
        }
        message={`¿Desea rechazar la solicitud?`}
        tooltipMessage="Rechazar"
        confirmText="Rechazar"
        onConfirm={rejectRequest}
      />
    </div>
  );
};

export default HandleUserRelationRequest;
