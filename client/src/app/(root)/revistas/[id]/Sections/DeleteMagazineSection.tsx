"use client";
import { deleteSection } from "@/app/server/magazineActions";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { Button } from "@nextui-org/react";
import { useRouter } from "next-nprogress-bar";
import { IoTrashOutline } from "react-icons/io5";

const DeleteMagazineSection = ({
  sectionId,
  magazineId,
  ownerType,
}: {
  sectionId: string;
  magazineId: string;
  ownerType: "user" | "group";
}) => {
  const router = useRouter();
  const handleDelete = async () => {
    const res = await deleteSection(sectionId, magazineId, ownerType);
    if ("error" in res) {
      toastifyError(res.error as string);
      return;
    }
    toastifySuccess(res.message);
    router.refresh();
  };

  return (
    <ConfirmModal
      ButtonAction={
        <Button
          isIconOnly
          aria-label="Eliminar sección"
          color="danger"
          radius="full"
          variant="flat"
        >
          <IoTrashOutline className="size-4" />
        </Button>
      }
      message="¿Desea eliminar la sección de la revista?"
      tooltipMessage="Eliminar sección"
      confirmText="Eliminar"
      onConfirm={handleDelete}
    />
  );
};

export default DeleteMagazineSection;
