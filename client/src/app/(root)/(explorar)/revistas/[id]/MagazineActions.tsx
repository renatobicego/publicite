import SecondaryButton from "@/components/buttons/SecondaryButton";
import ShareButton from "@/components/buttons/ShareButton";
import InviteCollabMagazine from "@/components/modals/InviteCollabMagazine";
import { Magazine } from "@/types/postTypes";
import { EDIT_MAGAZINE } from "@/utils/data/urls";
import { Link } from "@nextui-org/react";
import React from "react";

const MagazineActions = ({
  isOwner,
  magazine,
}: {
  isOwner: boolean;
  magazine: Magazine;
}) => {
  return (
    <div className="flex gap-2 items-center max-md:flex-wrap justify-center">
      {!isOwner && (
        <>
          <SecondaryButton as={Link} href={`${EDIT_MAGAZINE}/${magazine._id}`}>
            Editar
          </SecondaryButton>
          <InviteCollabMagazine />
        </>
      )}
      <ShareButton post={magazine} />
    </div>
  );
};

export default MagazineActions;
