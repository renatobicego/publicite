"use client";
import SecondaryButton from "../../buttons/SecondaryButton";
import { GroupMagazine, Magazine, UserMagazine } from "@/types/magazineTypes";
import InvitationModal from "./InvitationModal";
import { emitMagazineNotification } from "@/components/notifications/magazines/emitNotifications";
import { useSocket } from "@/app/socketProvider";
import { useUserData } from "@/app/(root)/providers/userDataProvider";
import { Group } from "@/types/groupTypes";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { handleMagazineNotificationError } from "@/components/notifications/magazines/actions";

const InviteCollabMagazine = ({ magazine }: { magazine: Magazine }) => {
  const { updateSocketToken } = useSocket();
  const { userIdLogged, usernameLogged } = useUserData();
  const handleInvite = async (selectedUsers: string[]) => {
    const socket = await updateSocketToken();

    selectedUsers.forEach((userId) =>
      emitMagazineNotification(
        socket,
        magazine,
        { username: usernameLogged as string, _id: userIdLogged as string },
        userId,
        "notification_magazine_new_user_invited",
        null
      )
        .then(() => toastifySuccess("Invitación enviada con éxito"))
        .catch(handleMagazineNotificationError)
    );
  };
  return (
    <InvitationModal
      title={`Invitar Colaboradores a ${magazine.name}`}
      handleSubmit={handleInvite}
      triggerElement={
        <SecondaryButton variant="flat" className="order-last">
          Invitar Colaboradores
        </SecondaryButton>
      }
      isGroupMembersInviteId={
        magazine.ownerType === "group"
          ? ((magazine as GroupMagazine).group as Group)._id
          : undefined
      }
      filterUsers={
        magazine.ownerType === "group"
          ? [
              ...(magazine as GroupMagazine).allowedCollaborators.map(
                (user) => user._id
              ),
              userIdLogged as string,
            ]
          : [
              ...(magazine as UserMagazine).collaborators.map(
                (user) => user._id
              ),
              userIdLogged as string,
            ]
      }
    />
  );
};

export default InviteCollabMagazine;
