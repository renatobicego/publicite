"use client";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { deleteUserRelation } from "@/services/userServices";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import React from "react";
import { IoTrashOutline } from "react-icons/io5";

const DeleteUserRelation = ({relationId} : {relationId: string}) => {
  const router = useRouter();
    const handleDelete = async () => {
    const res = await deleteUserRelation(relationId);
    if (res.error) {
      toastifyError(res.error);
      return;
    }
    toastifySuccess(res.message || "Relación eliminada");
    router.refresh();
  };
  return (
    <ConfirmModal
      ButtonAction={
        <Button isIconOnly color="danger" radius="full" variant="flat">
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
