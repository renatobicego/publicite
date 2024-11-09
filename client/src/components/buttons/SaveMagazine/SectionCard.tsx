import { MagazineSection } from "@/types/magazineTypes";
import { Button } from "@nextui-org/react";
import { IoTrashOutline } from "react-icons/io5";

const SectionCard = ({
  magazineName,
  isPostInSection,
  section,
  handleDeletePostClick,
  handleSelectMagazineSection,
  selectedMagazineSection,
}: {
  magazineName?: string;
  isPostInSection: (sectionId: string) => boolean;
  section: MagazineSection;
  handleDeletePostClick: (sectionId: string) => void;
  handleSelectMagazineSection: (sectionId: string) => void;
  selectedMagazineSection: {
    id: string;
    magazineId: string;
  };
  }) => {
  console.log(magazineName)
  return (
    <Button
      variant="bordered"
      startContent={
        isPostInSection(section._id) ? (
          <IoTrashOutline className="min-w-4" />
        ) : (
          <></>
        )
      }
      onPress={() => {
        if (isPostInSection(section._id)) {
          handleDeletePostClick(section._id);
          return;
        }
        handleSelectMagazineSection(section._id);
      }}
      className={`justify-start w-full ${
        selectedMagazineSection.id === section._id ? "border-primary" : ""
      } ${isPostInSection(section._id) ? "text-primary border-primary" : ""}`}
    >
      {magazineName ? magazineName : section.isFatherSection ? (
        <span className="italic">Seccion General</span>
      ) : (
        section.title
      )}
    </Button>
  );
};

export default SectionCard;
