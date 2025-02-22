"use client";

const ConfirmModal = lazy(() => import("@/components/modals/ConfirmModal"));
import {
  Dropdown,
  DropdownTrigger,
  Button,
  DropdownMenu,
  DropdownItem,
  Spinner,
} from "@nextui-org/react";
import { lazy, Suspense, useRef } from "react";
import { FaChevronDown, FaRegUser } from "react-icons/fa6";
import { IoTrashOutline } from "react-icons/io5";
import DeleteCollaborators from "./DeleteCollaborators";
import { User } from "@/types/userTypes";
import { Magazine } from "@/types/magazineTypes";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { useRouter } from "next-nprogress-bar";
import { removeMagazine } from "@/app/server/magazineActions";
import {
  useMagazinesData,
  useUserData,
} from "@/app/(root)/providers/userDataProvider";
import { PROFILE } from "@/utils/data/urls";

const MagazineOptionsDropdown = ({
  collaborators,
  ownerType,
  magazine,
}: {
  collaborators: User[];
  ownerType: "user" | "group";
  magazine: Magazine;
}) => {
  const { removeMagazineOfStore } = useMagazinesData();
  const { userIdLogged } = useUserData();
  const handleDelete = async () => {
    const res = await removeMagazine(magazine._id, ownerType);
    if (res.error) {
      toastifyError(res.error);
      return;
    }
    removeMagazineOfStore(magazine._id);
    toastifySuccess(res.message as string);
    window.location.replace(`${PROFILE}/${userIdLogged}`);
  };
  const confirmDeleteRef = useRef<() => void>(() => {});
  const modalDeleteCollaboratorRef = useRef<() => void>(() => {});
  const handleDeleteMagazineClick = () => {
    if (confirmDeleteRef.current) {
      confirmDeleteRef.current(); // Trigger custom open function to open the modal
    }
  };
  const handleDeleteCollaboratorsClick = () => {
    if (modalDeleteCollaboratorRef.current) {
      modalDeleteCollaboratorRef.current(); // Trigger custom open function to open the modal
    }
  };
  return (
    <>
      <Dropdown
        classNames={{
          trigger: "absolute top-0 right-0",
        }}
        placement="bottom-end"
      >
        <DropdownTrigger>
          <Button
            variant="light"
            isIconOnly
            aria-label="opciones de revista"
            radius="full"
            size="sm"
          >
            <FaChevronDown />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="acciones de revista">
          <DropdownItem
            startContent={<FaRegUser />}
            key="borrar colaboradores"
            className="text-danger rounded-full px-4"
            color="danger"
            onPress={handleDeleteCollaboratorsClick}
          >
            Borrar Colaboradores
          </DropdownItem>
          <DropdownItem
            startContent={<IoTrashOutline />}
            key="borrar revista"
            className="text-danger rounded-full px-4"
            color="danger"
            onPress={handleDeleteMagazineClick}
          >
            Borrar Revista
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <Suspense fallback={<Spinner color="warning" />}>
        <ConfirmModal
          ButtonAction={<></>}
          message="¿Desea eliminar la revista?"
          tooltipMessage="Eliminar revista"
          confirmText="Eliminar"
          onConfirm={handleDelete}
          customOpen={(openModal) => (confirmDeleteRef.current = openModal)}
        />
      </Suspense>
      <DeleteCollaborators
        ButtonAction={<></>}
        magazine={magazine}
        customOpen={(openModal) =>
          (modalDeleteCollaboratorRef.current = openModal)
        }
        collaborators={collaborators}
        ownerType={ownerType}
      />
    </>
  );
};

export default MagazineOptionsDropdown;
