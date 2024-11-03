"use client";
import { exitFromGroup, removeGroup } from "@/app/server/groupActions";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { GROUPS } from "@/utils/data/urls";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import useUploadImage from "@/utils/hooks/useUploadImage";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { useRouter } from "next-nprogress-bar";
import { useRef } from "react";
import { FaShareAlt } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa6";
import { IoIosExit } from "react-icons/io";
import { IoTrashOutline } from "react-icons/io5";

const OptionsDropdown = ({
  groupId,
  isMember,
  isCreator,
  image,
  membersIds
}: {
  groupId: string;
  isMember: boolean;
  isCreator: boolean;
    image?: string;
  membersIds: string[]
}) => {
  const deleteGroupRef = useRef<() => void>(() => {});
  const router = useRouter();
  const { deleteFile } = useUploadImage();
  const handleDeleteGroupClick = () => {
    if (deleteGroupRef.current) {
      deleteGroupRef.current(); // Trigger custom open function to open the modal
    }
  };

  const deleteGroup = async () => {
    if (isCreator) {
      const res = await removeGroup(groupId);
      if ("error" in res) {
        toastifyError(res.error as string);
        return;
      }
      if (image) {
        await deleteFile(image);
      }
      toastifySuccess(res.message);
      router.push(GROUPS);
    } else {
      toastifyError("No puedes eliminar este grupo");
    }
  };
  
  const exitGroup = async () => {
    if(isCreator && membersIds.length > 0) {
      toastifyError("No puedes abandonar el grupo si eres el dueño.");
      return
    }
    const res = await exitFromGroup(groupId);
    if ("error" in res) {
      toastifyError(res.error as string);
      return;
    }
    toastifySuccess(res.message);
    router.refresh();
    router.replace(GROUPS);
  }
  return (
    <>
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Button radius="full" isIconOnly variant="light">
            <FaChevronDown />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="opciones de perfil">
          <DropdownItem
            startContent={<FaShareAlt className="ml-1 mr-0.5" />}
            color="secondary"
            key="compartir"
            className="rounded-full px-4"
          >
            Compartir
          </DropdownItem>
          <DropdownItem
            startContent={<IoIosExit className="size-5" />}
            color="danger"
            key="salir"
            onPress={exitGroup}
            className={`rounded-full px-4 ${isMember ? "" : "hidden"}`}
          >
            Salir del Grupo
          </DropdownItem>
          <DropdownItem
            className={`rounded-full px-5 ${isCreator ? "" : "hidden"}`}
            key="delete-group"
            color="danger"
            startContent={<IoTrashOutline className="size-4" />}
            onClick={handleDeleteGroupClick} // Open ConfirmModal on dropdown item click
          >
            Borrar Grupo
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <ConfirmModal
        ButtonAction={<></>}
        message={`¿Está seguro que desea eliminar el grupo?`}
        tooltipMessage="Eliminar"
        confirmText="Eliminar"
        onConfirm={deleteGroup}
        customOpen={(openModal) => (deleteGroupRef.current = openModal)} // Set the reference for customOpen
      />
    </>
  );
};

export default OptionsDropdown;
