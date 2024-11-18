import { useUserData } from "@/app/(root)/providers/userDataProvider";
import { removePostInMagazineSection } from "@/app/server/magazineActions";
import { Magazine } from "@/types/magazineTypes";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import AccordionSections from "./AccordionSections";
import SectionCard from "./SectionCard";
import ConfirmDelete from "./ConfirmDelete";

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
  const [sectionToDeletePost, setSectionToDeletePost] = useState<string | null>(
    null
  );
  const { fetchMagazines } = useUserData();

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

  const deletePost = async () => {
    if (!sectionToDeletePost) return;

    const res = await removePostInMagazineSection(
      magazine._id,
      savedPost?.postId as string,
      sectionToDeletePost,
      magazine.ownerType
    );

    if (res.error) {
      toastifyError(res.error as string);
      return;
    }

    fetchMagazines();
    toastifySuccess(res.message as string);
  };
  const deletePostRef = useRef<() => void>(() => {});

  const handleDeletePostClick = (sectionId: string) => {
    setSectionToDeletePost(sectionId);
    if (deletePostRef.current) {
      deletePostRef.current();
    }
  };

  const isPostInSection = (sectionId: string) => {
    return savedPost?.section === sectionId;
  };

  return (
    <>
      <ConfirmDelete deletePost={deletePost} deletePostRef={deletePostRef} />
      {magazine.sections.length > 1 ? (
        <AccordionSections
          isPostInSection={isPostInSection}
          savedPost={savedPost}
          magazine={magazine}
          handleDeletePostClick={handleDeletePostClick}
          handleSelectMagazineSection={handleSelectMagazineSection}
          selectedMagazineSection={selectedMagazineSection}
        />
      ) : (
        <SectionCard
          magazineName={magazine.name}
          ownerType={magazine.ownerType}
          handleDeletePostClick={handleDeletePostClick}
          isPostInSection={isPostInSection}
          section={magazine.sections[0]}
          handleSelectMagazineSection={handleSelectMagazineSection}
          selectedMagazineSection={selectedMagazineSection}
        />
      )}
    </>
  );
};

export default MagazineCard;
