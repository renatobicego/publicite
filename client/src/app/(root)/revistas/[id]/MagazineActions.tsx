import SecondaryButton from "@/components/buttons/SecondaryButton";
import ShareButton from "@/components/buttons/ShareButton";
import InviteCollabMagazine from "@/components/modals/InvitationModal/InviteCollabMagazine";
import { Magazine } from "@/types/magazineTypes";
import { EDIT_MAGAZINE } from "@/utils/data/urls";
import { Link } from "@nextui-org/react";
import React from "react";
import ExitMagazine from "./Options/ExitMagazine";
import { currentUser } from "@clerk/nextjs/server";

const MagazineActions = async ({
  isOwner,
  magazine,
  isCollaborator,
}: {
  isOwner: boolean;
  magazine: Magazine;
  isCollaborator: boolean;
}) => {
  const user = await currentUser();
  return (
    <div className="flex gap-2 items-center max-md:flex-wrap justify-center">
      {isOwner && (
        <>
          <SecondaryButton as={Link} href={`${EDIT_MAGAZINE}/${magazine._id}`}>
            Editar
          </SecondaryButton>
          <InviteCollabMagazine magazine={magazine} />
        </>
      )}
      <ShareButton
        shareType="magazine"
        data={{
          _id: magazine._id,
          description: magazine.name,
          type: "magazine",
          username: user?.username as string,
        }}
      />
      {isCollaborator && (
        <ExitMagazine
          magazineId={magazine._id}
          ownerType={magazine.ownerType}
        />
      )}
    </div>
  );
};

export default MagazineActions;
