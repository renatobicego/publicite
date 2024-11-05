import { addPostToMagazine } from "@/app/server/magazineActions";
import { CREATE_MAGAZINE } from "@/utils/data/urls";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { Dispatch, DOMAttributes, SetStateAction, useState } from "react";
import PrimaryButton from "../PrimaryButton";
import MagazineCard from "./MagazineCard";
import { Link } from "@nextui-org/react";
import { Magazine } from "@/types/magazineTypes";

const SavePostLogic = ({
  titleProps,
  postId,
  magazines,
  setSavedRecently,
}: {
  titleProps: DOMAttributes<HTMLElement>;
  postId: string;
  magazines: Magazine[];
  setSavedRecently: Dispatch<SetStateAction<boolean>>;
}) => {
  const [selectedMagazineSection, setSelectedMagazineSection] = useState<{
    id: string;
    magazineId: string;
  }>({
    id: "",
    magazineId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddPost = async () => {
    setIsSubmitting(true);
    const res = await addPostToMagazine(
      selectedMagazineSection.magazineId,
      postId,
      selectedMagazineSection.id,
      magazines.find(
        (magazine) => magazine._id === selectedMagazineSection.magazineId
      )?.ownerType as "user" | "group"
    );
    if (res.error) {
      setIsSubmitting(false);
      toastifyError(res.error as string);
      return;
    }

    setSavedRecently(true);
    setIsSubmitting(false);
    toastifySuccess(res.message as string);
  };
  return (
    <div className="px-1 py-2 w-full">
      <p className="text-sm font-semibold text-text-color" {...titleProps}>
        Guardar en Revista
      </p>
      <div className="mt-2 flex flex-col gap-2 w-full">
        <p className="text-xs">Tus revistas</p>
        {magazines.map((magazine) => (
          <MagazineCard
            key={magazine._id}
            magazine={magazine}
            selectedMagazineSection={selectedMagazineSection}
            setSelectedMagazineSection={setSelectedMagazineSection}
          />
        ))}
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
    </div>
  );
};

export default SavePostLogic;
