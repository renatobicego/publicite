import { FaPlus } from "react-icons/fa6";
import PrimaryButton from "../../buttons/PrimaryButton";
import InvitationModal from "./InvitationModal";
import { Group } from "@/types/groupTypes";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { emitGroupNotification } from "@/components/notifications/groups/emitNotifications";
import { useSocket } from "@/app/socketProvider";
import { useUserData } from "@/app/(root)/providers/userDataProvider";
import { User } from "@/types/userTypes";

const InviteUsersGroup = ({ group }: { group: Group }) => {
  const { usernameLogged: username, userIdLogged } = useUserData();
  const { socket } = useSocket();

  const handleInvite = (selectedUsers: string[]) => {
    if (!socket) {
      toastifyError(
        "Error al enviar la solicitud. Por favor recarga la página e intenta de nuevo."
      );
      return;
    }
    try {
      selectedUsers.forEach((user) => {
        emitGroupNotification(
          socket,
          group,
          { username: username as string, _id: userIdLogged as string },
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
        ...group.members.map((user) => (user as User)._id),
        group.creator,
        ...group.admins.map((user) => (user as User)._id),
      ]}
    />
  );
};

export default InviteUsersGroup;
