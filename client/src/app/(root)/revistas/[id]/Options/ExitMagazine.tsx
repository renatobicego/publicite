"use client";
import { useMagazinesData } from "@/app/(root)/providers/userDataProvider";
import { exitMagazine } from "@/app/server/magazineActions";
const ConfirmModal = lazy(() => import("@/components/modals/ConfirmModal"));
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { Button, Spinner } from "@nextui-org/react";
import { useRouter } from "next-nprogress-bar";
import { lazy, Suspense } from "react";
import { IoExitOutline } from "react-icons/io5";

const ExitMagazine = ({
  magazineId,
  ownerType,
}: {
  magazineId: string;
  ownerType: "user" | "group";
}) => {
  const router = useRouter();
  const { removeMagazineOfStore } = useMagazinesData();
  const handleExit = async () => {
    const res = await exitMagazine(magazineId, ownerType);
    if (res.error) {
      toastifyError(res.error as string);
      return;
    }
    removeMagazineOfStore(magazineId);
    toastifySuccess(res.message as string);
    router.refresh();
  };
  return (
    <Suspense fallback={<Spinner color="warning" />}>
      <ConfirmModal
        ButtonAction={
          <Button
            isIconOnly
            aria-label="Salir como colaborador de revista"
            variant="flat"
            color="danger"
            radius="full"
          >
            <IoExitOutline className="size-4" />
          </Button>
        }
        confirmText="Salir de Revista"
        message="¿Desea salir como colaborador de la revista?"
        tooltipMessage="Salir de la revista"
        onConfirm={handleExit}
      />
    </Suspense>
  );
};

export default ExitMagazine;
