import { addPostToMagazine } from "@/app/server/magazineActions";
import { CREATE_MAGAZINE } from "@/utils/data/urls";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { DOMAttributes, useState } from "react";
import PrimaryButton from "../PrimaryButton";
import MagazineCard from "./MagazineCard";
import { Link, Spinner } from "@nextui-org/react";
import { Magazine } from "@/types/magazineTypes";
import { useMagazinesData } from "@/app/(root)/providers/userDataProvider";

const SavePostLogic = ({
  titleProps,
  postId,
  magazines,
  saved,
}: {
  titleProps: DOMAttributes<HTMLElement>;
  postId: string;
  magazines?: Magazine[];
  saved: {
    postId: string;
    section: string;
  }[];
  }) => {
  const {addPost} = useMagazinesData();
  // the selected magazine section and magazine id
  const [selectedMagazineSection, setSelectedMagazineSection] = useState<{
    id: string;
    magazineId: string;
  }>({
    id: "",
    magazineId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // add post to section
  const handleAddPost = async () => {
    setIsSubmitting(true);
    const res = await addPostToMagazine(
      selectedMagazineSection.magazineId,
      postId,
      selectedMagazineSection.id,
      magazines?.find(
        (magazine) => magazine._id === selectedMagazineSection.magazineId
      )?.ownerType as "user" | "group" // get the ownerType of the magazine where the post will be added
    );
    if (res.error) {
      setIsSubmitting(false);
      toastifyError(res.error as string);
      return;
    }

    addPost(postId, selectedMagazineSection.id);
    setIsSubmitting(false);
    toastifySuccess(res.message as string);
  };
  return (
    <div className="px-1 py-2 w-full">
      <p className="text-sm font-semibold text-text-color" {...titleProps}>
        Guardar en Revista
      </p>
      <div className="my-2 py-1 flex flex-col gap-2 w-full max-h-[250px] overflow-y-auto overflow-x-hidden">
        <p className="text-xs">Tus revistas</p>
        {magazines ? (
          magazines.map((magazine) => {
            const magazineSectionsIds = magazine.sections.map(
              (section) => section._id
            );
            const getPostSavedInThisMagazine = saved?.find((post) =>
              magazineSectionsIds.includes(post.section)
            );
            return (
              <MagazineCard
                key={magazine._id}
                magazine={magazine}
                selectedMagazineSection={selectedMagazineSection}
                setSelectedMagazineSection={setSelectedMagazineSection}
                savedPost={getPostSavedInThisMagazine}
              />
            );
          })
        ) : (
          <Spinner color="warning" />
        )}
      </div>
      {saved.length > 0 && (
        <p className="text-xs mb-1">
          Para eliminar de la revista, clickea en el ícono de la revista
        </p>
      )}
      {selectedMagazineSection.id !== "" ? (
        <PrimaryButton
          isDisabled={isSubmitting}
          isLoading={isSubmitting}
          onPress={handleAddPost}
        >
          Agregar Anuncio
        </PrimaryButton>
      ) : (
        <PrimaryButton as={Link} href={`${CREATE_MAGAZINE}/${postId}`}>
          Crear Revista
        </PrimaryButton>
      )}
    </div>
  );
};

export default SavePostLogic;
