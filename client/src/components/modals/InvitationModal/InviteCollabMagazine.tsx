"use client";
import SecondaryButton from "../../buttons/SecondaryButton";
import { GroupMagazine, Magazine, UserMagazine } from "@/types/magazineTypes";
import InvitationModal from "./InvitationModal";
import { emitMagazineNotification } from "@/components/notifications/magazines/emitNotifications";
import { useSocket } from "@/app/socketProvider";
import { useUserData } from "@/app/(root)/providers/userDataProvider";

const InviteCollabMagazine = ({ magazine }: { magazine: Magazine }) => {
  const { updateSocketToken } = useSocket();
  const { userIdLogged, usernameLogged } = useUserData();
  const handleInvite = async(selectedUsers: string[]) => {
    const socket = await updateSocketToken();

    selectedUsers.forEach((userId) =>
      emitMagazineNotification(
        socket,
        magazine,
        { username: usernameLogged as string, _id: userIdLogged as string },
        userId,
        "notification_magazine_new_user_invited"
      )
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
          ? (magazine as GroupMagazine).group._id
          : undefined
      }
      filterUsers={
        magazine.ownerType === "group"
          ? (magazine as GroupMagazine).allowedCollaborators.map(
              (user) => user._id
            )
          : (magazine as UserMagazine).collaborators.map((user) => user._id)
      }
    />
  );
};

export default InviteCollabMagazine;
