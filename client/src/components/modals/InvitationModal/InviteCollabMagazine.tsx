"use client";
import SecondaryButton from "../../buttons/SecondaryButton";
import { GroupMagazine, Magazine, UserMagazine } from "@/types/magazineTypes";
import InvitationModal from "./InvitationModal";

const InviteCollabMagazine = ({ magazine }: { magazine: Magazine }) => {
  const handleInvite = (selectedUsers: string[]) => {};
  return (
    <InvitationModal
      title={`Invitar Colaboradores a ${magazine.name}`}
      handleSubmit={handleInvite}
      triggerElement={
        <SecondaryButton variant="flat" className="order-last">
          Invitar Colaboradores
        </SecondaryButton>
      }
      filterUsers={
        magazine.ownerType === "group"
          ? (magazine as GroupMagazine).allowedCollaborators.map((user) => user._id)
          : (magazine as UserMagazine).collaborators.map((user) => user._id)
      }
    />
  );
};

export default InviteCollabMagazine;
