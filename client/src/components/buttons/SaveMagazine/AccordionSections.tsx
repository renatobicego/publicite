import { Magazine } from "@/types/magazineTypes";
import { Accordion, AccordionItem, Button } from "@nextui-org/react";
import { FaChevronLeft } from "react-icons/fa6";
import SectionCard from "./SectionCard";

const AccordionSections = ({
  magazine,
  savedPost,
  handleDeletePostClick,
  handleSelectMagazineSection,
  isPostInSection,
  selectedMagazineSection,
}: {
  magazine: Magazine;
  savedPost?: { postId: string; section: string };
  handleDeletePostClick: (sectionId: string) => void;
  handleSelectMagazineSection: (sectionId: string) => void;
  selectedMagazineSection: {
    id: string;
    magazineId: string;
  };
  isPostInSection: (sectionId: string) => boolean;
}) => {
  return (
    <>
      <Accordion variant="bordered" isCompact>
        <AccordionItem
          HeadingComponent={"h6"}
          indicator={<FaChevronLeft className={`size-3`} />}
          title={magazine.name}
          subtitle={savedPost ? "Guardado" : ""}
          classNames={{
            title: `text-small font-normal ${savedPost ? "text-primary" : ""}`,
            subtitle: "text-xs text-primary",
            content: `flex flex-col gap-1`,
          }}
        >
          {magazine.sections.map((section) => (
            <SectionCard
              key={section._id}
              handleDeletePostClick={handleDeletePostClick}
              handleSelectMagazineSection={handleSelectMagazineSection}
              isPostInSection={isPostInSection}
              section={section}
              selectedMagazineSection={selectedMagazineSection}
            />
          ))}
        </AccordionItem>
      </Accordion>
    </>
  );
};

export default AccordionSections;
