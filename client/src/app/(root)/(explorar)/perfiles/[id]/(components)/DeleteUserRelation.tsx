"use client";
import { setActiveRelations } from "@/app/(root)/providers/slices/configSlice";
import { useConfigData } from "@/app/(root)/providers/userDataProvider";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { getActiveRelations } from "@/services/postsServices";
import { deleteUserRelation } from "@/services/userServices";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import React from "react";
import { IoTrashOutline } from "react-icons/io5";

const DeleteUserRelation = ({ relationId }: { relationId: string }) => {
  const { updateActiveRelations } = useConfigData();
  const router = useRouter();
  const handleDelete = async () => {
    const res = await deleteUserRelation(relationId);
    if (res.error) {
      toastifyError(res.error);
      return;
    }
    toastifySuccess(res.message || "Relación eliminada");
    const newActiveRelations = await getActiveRelations();
    if (!("error" in newActiveRelations)) {
      updateActiveRelations(newActiveRelations);
    }
    router.refresh();
  };
  return (
    <ConfirmModal
      ButtonAction={
        <Button
          isIconOnly
          aria-label="Eliminar Relación"
          color="danger"
          radius="full"
          variant="flat"
        >
          <IoTrashOutline className="size-4" />
        </Button>
      }
      confirmText="Eliminar"
      message="¿Desea eliminar la relación con este usuario?"
      onConfirm={handleDelete}
      tooltipMessage="Eliminar Relación"
    />
  );
};

export default DeleteUserRelation;
