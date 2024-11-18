"use client";
import { exitMagazine } from "@/app/server/magazineActions";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { Button } from "@nextui-org/react";
import { useRouter } from "next-nprogress-bar";
import { IoExitOutline } from "react-icons/io5";

const ExitMagazine = ({
  magazineId,
  ownerType,
}: {
  magazineId: string;
  ownerType: "user" | "group";
}) => {
  const router = useRouter();
  const handleExit = async () => {
    const res = await exitMagazine(magazineId, ownerType);
    if (res.error) {
      toastifyError(res.error as string);
      return;
    }
    toastifySuccess(res.message as string);
    router.refresh();
  };
  return (
    <ConfirmModal
      ButtonAction={
        <Button isIconOnly variant="flat" color="danger" radius="full">
          <IoExitOutline className="size-4" />
        </Button>
      }
      confirmText="Salir de Revista"
      message="¿Desea salir como colaborador de la revista?"
      tooltipMessage="Salir de la revista"
      onConfirm={handleExit}
    />
  );
};

export default ExitMagazine;
