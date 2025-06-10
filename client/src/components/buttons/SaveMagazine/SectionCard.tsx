import { MagazineSection } from "@/types/magazineTypes";
import { Button } from "@nextui-org/react";
import { IoTrashOutline } from "react-icons/io5";

const SectionCard = ({
  magazineName,
  ownerType,
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
  ownerType?: "user" | "group";
}) => {
  const showOwnerType = ownerType
    ? ownerType === "group"
      ? "Revista de grupo"
      : "Revista de usuario"
    : null;
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
      className={`justify-start w-full flex-shrink-0 ${
        selectedMagazineSection.id === section._id ? "border-primary" : ""
      } ${isPostInSection(section._id) ? "text-primary border-primary" : ""}
      `}
    >
      <div
        className={`${
          showOwnerType && "flex flex-col gap-0 items-start justify-center h-12"
        }`}
      >
        {magazineName ? (
          magazineName
        ) : section.isFatherSection ? (
          <span className="italic">Seccion General</span>
        ) : (
          section.title
        )}
        {showOwnerType && (
          <span className="text-xs text-default-400">{showOwnerType}</span>
        )}
      </div>
    </Button>
  );
};

export default SectionCard;
