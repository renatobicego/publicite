import CreateMagazineSection from "@/components/modals/MagazineSection/CreateMagazineSection";
import ManageMagazineSections from "@/components/modals/MagazineSection/ManageMagazineSections";
import { MagazineSection } from "@/types/magazineTypes";
import React from "react";

const MagazineSectionActions = ({
  magazineId,
  groupId,
  ownerType,
  sections,
}: {
  magazineId: string;
  groupId?: string;
  ownerType: "user" | "group";
  sections: MagazineSection[];
}) => {
  return (
    <div className="flex gap-2 items-center absolute top-0 right-0">
      <CreateMagazineSection magazineId={magazineId} groupId={groupId} />
      <ManageMagazineSections
        ownerType={ownerType}
        magazineId={magazineId}
        sections={sections}
      />
    </div>
  );
};

export default MagazineSectionActions;
