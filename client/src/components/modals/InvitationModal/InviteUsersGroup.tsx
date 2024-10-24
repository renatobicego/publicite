import { FaPlus } from "react-icons/fa6";
import PrimaryButton from "../../buttons/PrimaryButton";
import InvitationModal from "./InvitationModal";
import { Group } from "@/types/groupTypes";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { emitGroupNotification } from "@/components/notifications/groups/emitNotifications";
import { useSocket } from "@/app/socketProvider";

const InviteUsersGroup = ({ group, username }: { group: Group; username: string }) => {
  const { socket } = useSocket();

  const handleInvite = (selectedUsers: string[]) => {
    try {
      selectedUsers.forEach((user) => {
        emitGroupNotification(
          socket,
          group,
          username,
          user,
          "notification_group_new_user_invited"
        );
      });
      toastifySuccess("Invitaciones enviadas correctamente");
    } catch (error) {
      toastifyError("Error al invitar miembros. Por favor intenta de nuevo.");
    }
  };
  return (
    <InvitationModal
      title={`Invitar Miembros a ${group.name}`}
      handleSubmit={handleInvite}
      triggerElement={
        <PrimaryButton startContent={<FaPlus />}>
          Invitar Miembros
        </PrimaryButton>
      }
      filterUsers={[
        ...group.members.map((user) => user._id),
        group.creator,
        ...group.admins.map((user) => user._id),
      ]}
    />
  );
};

export default InviteUsersGroup;
