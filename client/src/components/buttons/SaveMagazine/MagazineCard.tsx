import { Magazine } from "@/types/magazineTypes";
import { Accordion, AccordionItem, Button } from "@nextui-org/react";
import { Dispatch, SetStateAction } from "react";
import { FaChevronLeft } from "react-icons/fa6";

const MagazineCard = ({
  magazine,
  selectedMagazineSection,
  setSelectedMagazineSection,
}: {
  magazine: Magazine;
  selectedMagazineSection: {
    id: string;
    magazineId: string;
  };
  setSelectedMagazineSection: Dispatch<
    SetStateAction<{
      id: string;
      magazineId: string;
    }>
  >;
}) => {
  console.log(magazine);
  const handleSelectMagazineSection = (sectionId: string) => {
    if (selectedMagazineSection.id === sectionId) {
      setSelectedMagazineSection({
        id: "",
        magazineId: "",
      });
      return;
    }
    setSelectedMagazineSection({
      id: sectionId,
      magazineId: magazine._id,
    });
  };
  const fatherSection = magazine.sections.find(
    (section) => section.isFatherSection
  );
  if (magazine.sections.length > 1) {
    return (
      <Accordion variant="bordered" isCompact>
        <AccordionItem
          HeadingComponent={"h6"}
          indicator={<FaChevronLeft className="size-3" />}
          title={magazine.name}
          classNames={{
            title: "text-small font-normal",
            content: "flex flex-col gap-1",
          }}
        >
          {magazine.sections.map((section) => (
            <Button
              key={section._id}
              variant="bordered"
              onPress={() => handleSelectMagazineSection(section._id)}
              className={`justify-start w-full ${
                selectedMagazineSection.id === section._id
                  ? "border-primary"
                  : ""
              }`}
            >
              {section.title}
            </Button>
          ))}
        </AccordionItem>
      </Accordion>
    );
  } else {
    return (
      <Button
        onPress={() =>
          handleSelectMagazineSection(fatherSection?._id as string)
        }
        variant="bordered"
        className={`${
          selectedMagazineSection.id === fatherSection?._id
            ? "border-primary"
            : ""
        } justify-start`}
      >
        {magazine.name}
      </Button>
    );
  }
};

export default MagazineCard;
