import ConfirmModal from "@/components/modals/ConfirmModal";
import { Magazine } from "@/types/magazineTypes";
import { Accordion, AccordionItem, Button } from "@nextui-org/react";
import { Dispatch, SetStateAction, useRef } from "react";
import { FaChevronLeft } from "react-icons/fa6";

const MagazineCard = ({
  magazine,
  selectedMagazineSection,
  setSelectedMagazineSection,
  savedPost,
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
  savedPost?: {
    postId: string;
    section: string;
  };
}) => {
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
  const isSavedInSection = magazine.sections.some((section) =>
    section.posts.some((post) => post._id === savedPost?.postId)
  );
  const assignAdminRef = useRef<() => void>(() => {});
  const deletePost = () => {};

  const handleDeletePostClick = () => {
    if (assignAdminRef.current) {
      assignAdminRef.current(); // Trigger custom open function to open the modal
    }
  };
  if (magazine.sections.length > 1) {
    return (
      <>
        <ConfirmModal
          ButtonAction={<></>}
          message={`¿Está seguro de eliminar el anuncio de la revista/sección?`}
          tooltipMessage="Eliminar"
          confirmText="Eliminar"
          onConfirm={deletePost}
          customOpen={(openModal) => (assignAdminRef.current = openModal)} // Set the reference for customOpen
        />
        <Accordion variant="bordered" isCompact>
          <AccordionItem
            HeadingComponent={"h6"}
            indicator={<FaChevronLeft className="size-3" />}
            title={magazine.name}
            classNames={{
              title: "text-small font-normal",
              content: `flex flex-col gap-1 ${
                isSavedInSection ? "bg-primary text-white" : ""
              }`,
            }}
          >
            {magazine.sections.map((section) => (
              <Button
                key={section._id}
                variant="bordered"
                onPress={() => {
                  if (savedPost && savedPost?.section === section._id) {
                    handleDeletePostClick();
                    return;
                  }
                  handleSelectMagazineSection(section._id);
                }}
                className={`justify-start w-full ${
                  selectedMagazineSection.id === section._id
                    ? "border-primary"
                    : ""
                } ${
                  savedPost?.section === section._id
                    ? "bg-primary text-white"
                    : ""
                }`}
              >
                {section.title}
              </Button>
            ))}
          </AccordionItem>
        </Accordion>
      </>
    );
  } else {
    return (
      <>
        <Button
          onPress={() => {
            if (savedPost && savedPost?.section === fatherSection?._id) {
              handleDeletePostClick();
              return;
            }
            handleSelectMagazineSection(fatherSection?._id as string);
          }}
          variant="bordered"
          className={`${
            selectedMagazineSection.id === fatherSection?._id
              ? "border-primary"
              : ""
          } justify-start ${
            savedPost?.section === fatherSection?._id
              ? "bg-primary text-white"
              : ""
          }`}
        >
          {magazine.name}
        </Button>
        <ConfirmModal
          ButtonAction={<></>}
          message={`¿Está seguro de eliminar el anuncio de la revista/sección?`}
          tooltipMessage="Eliminar"
          confirmText="Eliminar"
          onConfirm={deletePost}
          customOpen={(openModal) => (assignAdminRef.current = openModal)} // Set the reference for customOpen
        />
      </>
    );
  }
};

export default MagazineCard;
